import { authClient } from "@/lib/auth/server";
import { hasActiveSubscription, safePanel } from "@/lib/auth/policy";
import Home from "@/components/Home";
import ProGate from "@/components/ProGate";
export const dynamic = "force-dynamic";
export default async function WorkspacePage({ searchParams }: { searchParams: Promise<{ panel?: string }> }) {
  const panel = safePanel((await searchParams).panel);
  const client = await authClient();
  if (!client) return <ProGate feature="workspace"/>;
  let user;
  try {
    const result = await client.auth.getUser();
    if (!result.error) user = result.data.user;
  } catch { /* Authentication failure denies access. */ }
  if (!user || !user.email_confirmed_at) return <ProGate feature="workspace"/>;
  const { data, error } = await client.from("subscriptions").select("provider,status,current_period_end").eq("user_id", user.id).maybeSingle();
  if (error || !hasActiveSubscription(data)) return <ProGate feature="workspace"/>;
  return <Home userId={user.id} initialPanel={panel}/>;
}
