import { authClient } from "@/lib/auth/server";
import { hasActiveSubscription } from "@/lib/auth/policy";
import BillingView from "./BillingView";
import "./billing.css";
export const dynamic = "force-dynamic";
export default async function Billing({ searchParams }: { searchParams: Promise<{ error?: string; canceled?: string }> }) {
  const query = await searchParams;
  const client = await authClient();
  const { data: { user } } = client ? await client.auth.getUser() : { data: { user: null } };
  const { data: row } = user?.email_confirmed_at ? await client!.from("subscriptions")
    .select("provider,status,current_period_end,currency,billing_interval,mollie_subscription_id")
    .eq("user_id", user.id).maybeSingle() : { data: null };
  return <BillingView signedIn={!!user?.email_confirmed_at} active={hasActiveSubscription(row)} status={row?.status}
    currency={row?.currency} interval={row?.billing_interval} end={row?.current_period_end}
    linked={!!row?.mollie_subscription_id} error={!!query.error} canceled={!!query.canceled}/>;
}
