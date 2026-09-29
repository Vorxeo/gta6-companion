import AuthForm from "@/components/auth/AuthForm";
import { authConfigured } from "@/lib/auth/server";
import { safePanel } from "@/lib/auth/policy";
export const dynamic = "force-dynamic";
export default async function Page({searchParams}: {searchParams:Promise<{panel?:string;next?:string;error?:string}>}) {
  const query = await searchParams;
  return <AuthForm mode="signup" configured={authConfigured()} panel={safePanel(query.panel)} next={["arcade","creator-lab","pricing","billing"].includes(query.next||"") ? query.next! : ""} confirmationError={query.error === "confirmation"}/>;
}
