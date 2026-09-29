import Home from "@/components/Home";
import { authClient } from "@/lib/auth/server";
import { hasActiveSubscription } from "@/lib/auth/policy";
export const dynamic = "force-dynamic";
export default async function Page() {
  const client = await authClient();
  if (!client) return <Home/>;
  try {
    const { data: { user }, error } = await client.auth.getUser();
    if (!error && user?.email_confirmed_at) {
      const entitlement = await client.from("subscriptions").select("provider,status,current_period_end").eq("user_id",user.id).maybeSingle();
      return <Home userId={!entitlement.error && hasActiveSubscription(entitlement.data) ? user.id : null} signedIn/>;
    }
  } catch { /* The public homepage remains available. */ }
  return <Home/>;
}
