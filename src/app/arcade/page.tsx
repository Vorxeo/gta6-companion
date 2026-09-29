import { authClient } from "@/lib/auth/server";
import { hasActiveSubscription } from "@/lib/auth/policy";
import ProGate from "@/components/ProGate";
import ArcadeGame from "@/components/ArcadeGame";
import "./arcade.css";
export const dynamic = "force-dynamic";
export default async function ArcadePage() {
  const client = await authClient();
  if (!client) return <ProGate feature="arcade"/>;
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user?.email_confirmed_at) return <ProGate feature="arcade"/>;
  const { data, error } = await client.from("subscriptions").select("provider,status,current_period_end").eq("user_id", user.id).maybeSingle();
  return error || !hasActiveSubscription(data) ? <ProGate feature="arcade"/> : <ArcadeGame userId={user.id}/>;
}
