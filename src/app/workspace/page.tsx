import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth/server";
import { hasActiveSubscription, safePanel } from "@/lib/auth/policy";
import Home from "@/components/Home";
export const dynamic = "force-dynamic";
export default async function WorkspacePage({ searchParams }: { searchParams: Promise<{ panel?: string }> }) {
  const panel = safePanel((await searchParams).panel);
  const client = await authClient();
  if (!client) redirect(`/sign-in?panel=${panel}`);
  let user;
  try {
    const result = await client.auth.getUser();
    if (!result.error) user = result.data.user;
  } catch { /* Authentication failure denies access. */ }
  if (!user || !user.email_confirmed_at) redirect(`/sign-in?panel=${panel}`);
  if (process.env.WORKSPACE_ACCESS === "subscription") {
    const { data, error } = await client.from("subscriptions").select("status,current_period_end").eq("user_id", user.id).maybeSingle();
    if (error || !hasActiveSubscription(data)) redirect("/pricing?access=subscription-required");
  }
  return <Home userId={user.id} initialPanel={panel}/>;
}
