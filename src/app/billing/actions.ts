"use server";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth/server";
import { billingAdmin, billingOperational, mollie } from "@/lib/billing/server";
export async function cancelSubscription() {
  const client = await authClient();
  const { data: { user } } = client ? await client.auth.getUser() : { data: { user: null } };
  if (!user?.email_confirmed_at) redirect("/sign-in?next=billing");
  if (!billingOperational()) redirect("/billing?error=unavailable");
  const admin = billingAdmin();
  const { data: row, error } = await admin.from("subscriptions")
    .select("provider,status,mollie_customer_id,mollie_subscription_id")
    .eq("user_id", user.id).maybeSingle();
  if (error || row?.provider !== "mollie" || !row.mollie_customer_id || !row.mollie_subscription_id || row.status !== "active")
    redirect("/billing?error=unavailable");
  try {
    await mollie<void>(`/customers/${encodeURIComponent(row.mollie_customer_id)}/subscriptions/${encodeURIComponent(row.mollie_subscription_id)}`, { method: "DELETE" });
    const updated = await admin.from("subscriptions").update({ status: "canceled", canceled_at: new Date().toISOString() })
      .eq("user_id", user.id).eq("mollie_subscription_id", row.mollie_subscription_id);
    if (updated.error) throw updated.error;
  } catch { redirect("/billing?error=unavailable"); }
  redirect("/billing?canceled=1");
}
