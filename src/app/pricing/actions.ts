"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { authClient, siteOrigin } from "@/lib/auth/server";
import { hasActiveSubscription } from "@/lib/auth/policy";
import { billingAdmin, checkoutConfiguredFor, mollie, recurringMethodAvailable, syncPayment, webhookUrl } from "@/lib/billing/server";
import { planFor } from "@/lib/billing/model";

type MollieCustomer = { id: string };
type MollieCheckout = { id: string; _links?: { checkout?: { href?: string } } };
function mollieCheckoutUrl(href: string | undefined) {
  const url = new URL(href || "");
  if (url.protocol !== "https:" || !(url.hostname === "mollie.com" || url.hostname.endsWith(".mollie.com")))
    throw new Error("Invalid Mollie checkout URL");
  return url.toString();
}
export async function startCheckout(form: FormData) {
  const plan = planFor(form.get("currency"), form.get("interval"));
  if (!plan || form.get("consent") !== "on") redirect("/pricing?error=invalid");
  if (!checkoutConfiguredFor(plan.currency)) redirect("/pricing?error=unavailable");
  const client = await authClient();
  if (!client) redirect("/sign-in?next=pricing");
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user?.email_confirmed_at) redirect("/sign-in?next=pricing");
  const { data: entitlement, error: entitlementError } = await client.from("subscriptions")
    .select("provider,status,current_period_end,mollie_subscription_id").eq("user_id", user.id).maybeSingle();
  if (entitlementError) redirect("/pricing?error=unavailable");
  if (hasActiveSubscription(entitlement) || entitlement?.mollie_subscription_id) redirect("/billing");
  let destination = "/pricing?error=checkout";
  try {
    if (!await recurringMethodAvailable(plan.currency, plan.value, plan.method)) throw new Error("Payment method unavailable");
    const admin = billingAdmin();
    const { data: existing, error: existingError } = await admin.from("billing_checkouts")
      .select("id,payment_id,status").eq("user_id", user.id).in("status", ["creating","open"]).maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      if (existing.payment_id) {
        const payment = await mollie<MollieCheckout & { status: string }>(`/payments/${existing.payment_id}`);
        if (["paid","failed","canceled","expired"].includes(payment.status)) {
          await syncPayment(existing.payment_id);
          destination = payment.status === "paid" ? "/billing" : "/pricing?error=retry";
        } else destination = mollieCheckoutUrl(payment._links?.checkout?.href);
      }
    } else {
    let { data: customer, error: customerError } = await admin.from("billing_customers").select("mollie_customer_id").eq("user_id", user.id).maybeSingle();
    if (customerError) throw customerError;
    if (!customer) {
      const created = await mollie<MollieCustomer>("/customers", { method: "POST", idempotencyKey: user.id,
        body: { name: user.email || "VI Companion member", email: user.email, metadata: { user_id: user.id } } });
      if (!/^cst_[a-zA-Z0-9]+$/.test(created.id)) throw new Error("Invalid customer response");
      const result = await admin.from("billing_customers").upsert({ user_id: user.id, mollie_customer_id: created.id }, { onConflict: "user_id" })
        .select("mollie_customer_id").single();
      if (result.error) throw result.error;
      customer = result.data;
    }
    const checkoutId = randomUUID();
    const inserted = await admin.from("billing_checkouts").insert({ id: checkoutId, user_id: user.id, customer_id: customer.mollie_customer_id,
      currency: plan.currency, billing_interval: plan.interval, amount_cents: plan.cents, status: "creating" });
    if (inserted.error) throw inserted.error;
    const locale = form.get("locale") === "es" ? "es_ES" : form.get("locale") === "pt-BR" ? "pt_PT" : form.get("locale") === "nl" ? "nl_NL" : "en_US";
    const payment = await mollie<MollieCheckout>("/payments", { method: "POST", idempotencyKey: `${checkoutId}:payment`,
      body: { amount: { currency: plan.currency, value: plan.value }, customerId: customer.mollie_customer_id,
        sequenceType: "first", method: plan.method, locale,
        description: `VI Companion Pro — ${plan.interval}`,
        redirectUrl: `${siteOrigin()}/billing/return?checkout=${checkoutId}`,
        webhookUrl: webhookUrl(), metadata: { checkout_id: checkoutId } } });
    const checkoutUrl = mollieCheckoutUrl(payment._links?.checkout?.href);
    if (!/^tr_[a-zA-Z0-9]+$/.test(payment.id)) throw new Error("Invalid checkout response");
    const updated = await admin.from("billing_checkouts").update({ payment_id: payment.id, status: "open" }).eq("id", checkoutId);
    if (updated.error) throw updated.error;
    destination = checkoutUrl;
    }
  } catch { /* No entitlement is granted for an incomplete checkout. */ }
  redirect(destination);
}
