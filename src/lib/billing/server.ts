import "server-only";
import { createClient } from "@supabase/supabase-js";
import { siteOrigin } from "@/lib/auth/server";
import { isReversed, matchesFirstPayment, matchesRenewal, periodEnd, planFor, type MolliePayment } from "./model";

export function billingOperational() {
  try {
    const origin = siteOrigin();
    const webhook = new URL(process.env.MOLLIE_WEBHOOK_BASE_URL || origin);
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.SUPABASE_SERVICE_ROLE_KEY && /^((test|live)_)/.test(process.env.MOLLIE_API_KEY || "") &&
      !!process.env.MOLLIE_WEBHOOK_SECRET && process.env.MOLLIE_WEBHOOK_SECRET.length >= 32 &&
      webhook.protocol === "https:";
  } catch { return false; }
}
export function billingConfigured() {
  try {
    return process.env.BILLING_ENABLED === "true" && billingOperational() &&
      new URL(process.env.MOLLIE_TERMS_URL || "").protocol === "https:" &&
      new URL(process.env.MOLLIE_PRIVACY_URL || "").protocol === "https:";
  } catch { return false; }
}

export function billingAdmin() {
  if (!billingOperational()) throw new Error("Billing unavailable");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } });
}

export function webhookUrl() {
  const base = new URL(process.env.MOLLIE_WEBHOOK_BASE_URL || siteOrigin());
  return `${base.origin}/api/mollie/webhook?token=${encodeURIComponent(process.env.MOLLIE_WEBHOOK_SECRET!)}`;
}

export async function mollie<T>(path: string, init: { method?: "POST" | "DELETE"; body?: unknown; idempotencyKey?: string } = {}): Promise<T> {
  const response = await fetch(`https://api.mollie.com/v2${path}`, {
    method: init.method || "GET", cache: "no-store",
    headers: { Authorization: `Bearer ${process.env.MOLLIE_API_KEY!}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  if (!response.ok) throw new Error(`Mollie HTTP ${response.status}`);
  if (init.method === "DELETE") return undefined as T;
  return response.json() as Promise<T>;
}

type MollieSubscription = { id: string; status: string };

export async function syncPayment(paymentId: string) {
  if (!billingOperational() || !/^tr_[a-zA-Z0-9]+$/.test(paymentId)) throw new Error("Invalid payment sync");
  const payment = await mollie<MolliePayment>(`/payments/${paymentId}`);
  const admin = billingAdmin();
  if (payment.sequenceType === "first") {
    const metadata = typeof payment.metadata === "string" ? JSON.parse(payment.metadata) : payment.metadata;
    const checkoutId = metadata && typeof metadata === "object" ? (metadata as { checkout_id?: unknown }).checkout_id : null;
    if (typeof checkoutId !== "string" || !/^[0-9a-f-]{36}$/i.test(checkoutId)) throw new Error("Missing checkout ID");
    const { data: checkout, error } = await admin.from("billing_checkouts").select("*").eq("id", checkoutId).maybeSingle();
    if (error || !checkout || checkout.payment_id !== paymentId) throw new Error("Checkout not ready");
    if (isReversed(payment)) {
      const revoked = await admin.from("subscriptions").update({ status: "past_due" })
        .eq("user_id", checkout.user_id).eq("last_payment_id", paymentId);
      if (revoked.error) throw new Error("Cannot revoke reversed payment");
      return payment.status;
    }
    if (payment.status !== "paid") {
      if (["failed","canceled","expired"].includes(payment.status)) {
        const closed = await admin.from("billing_checkouts").update({ status: "failed" }).eq("id", checkout.id).eq("payment_id", paymentId);
        if (closed.error) throw new Error("Cannot close checkout");
      }
      return payment.status;
    }
    if (!matchesFirstPayment(payment, { ...checkout, interval: checkout.billing_interval })) throw new Error("Payment mismatch");
    const end = periodEnd(payment.paidAt!, checkout.billing_interval);
    const recorded = await admin.rpc("record_mollie_first_payment", { p_checkout_id: checkout.id, p_payment_id: paymentId,
      p_paid_at: payment.paidAt, p_period_end: end });
    if (recorded.error || recorded.data !== true) throw new Error("Cannot record first payment");
    const { data: row, error: rowError } = await admin.from("subscriptions").select("mollie_subscription_id,status,last_payment_id")
      .eq("user_id", checkout.user_id).maybeSingle();
    if (rowError || !row || (!row.mollie_subscription_id && row.last_payment_id !== paymentId)) throw new Error("Subscription not ready");
    if (!row.mollie_subscription_id && row.status === "active") {
      const plan = planFor(checkout.currency, checkout.billing_interval);
      if (!plan) throw new Error("Invalid plan");
      const created = await mollie<MollieSubscription>(`/customers/${encodeURIComponent(checkout.customer_id)}/subscriptions`, {
        method: "POST", idempotencyKey: `${checkout.id}:subscription`,
        body: { amount: { currency: plan.currency, value: plan.value }, interval: plan.mollieInterval,
          startDate: end.slice(0, 10), description: "VI Companion Pro", webhookUrl: webhookUrl(),
          metadata: { checkout_id: checkout.id } },
      });
      if (!/^sub_[a-zA-Z0-9]+$/.test(created.id)) throw new Error("Invalid subscription response");
      const updated = await admin.from("subscriptions").update({ mollie_subscription_id: created.id })
        .eq("user_id", checkout.user_id).eq("last_payment_id", paymentId).is("mollie_subscription_id", null);
      if (updated.error) throw new Error("Cannot link subscription");
    }
    return "paid";
  }
  if (payment.sequenceType === "recurring" && payment.subscriptionId) {
    const { data: row, error } = await admin.from("subscriptions").select("user_id,mollie_subscription_id,mollie_customer_id,currency,billing_interval")
      .eq("mollie_subscription_id", payment.subscriptionId).maybeSingle();
    if (error || !row) throw new Error("Unknown subscription");
    if (isReversed(payment)) {
      const revoked = await admin.from("subscriptions").update({ status: "past_due" })
        .eq("user_id", row.user_id).eq("last_payment_id", paymentId);
      if (revoked.error) throw new Error("Cannot revoke reversed payment");
      return payment.status;
    }
    if (payment.status !== "paid") return payment.status;
    if (!matchesRenewal(payment, { ...row, interval: row.billing_interval })) throw new Error("Renewal mismatch");
    const end = periodEnd(payment.paidAt!, row.billing_interval);
    const recorded = await admin.rpc("record_mollie_renewal", { p_subscription_id: row.mollie_subscription_id,
      p_customer_id: row.mollie_customer_id, p_payment_id: paymentId, p_paid_at: payment.paidAt, p_period_end: end });
    if (recorded.error || recorded.data !== true) throw new Error("Cannot record renewal");
    return "paid";
  }
  return payment.status;
}
