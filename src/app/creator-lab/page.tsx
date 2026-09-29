import { authClient } from "@/lib/auth/server";
import { hasActiveSubscription } from "@/lib/auth/policy";
import ProGate from "@/components/ProGate";
import CreatorLab from "@/components/CreatorLab";
import "./lab.css";
export const dynamic = "force-dynamic";
export default async function CreatorLabPage() {
  const client = await authClient();
  if (!client) return <ProGate feature="creator-lab"/>;
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user?.email_confirmed_at) return <ProGate feature="creator-lab"/>;
  const { data, error } = await client.from("subscriptions").select("provider,status,current_period_end").eq("user_id", user.id).maybeSingle();
  return error || !hasActiveSubscription(data) ? <ProGate feature="creator-lab"/> : <CreatorLab userId={user.id}/>;
}
