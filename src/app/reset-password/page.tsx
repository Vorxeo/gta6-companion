import AuthForm from "@/components/auth/AuthForm";
import { authConfigured } from "@/lib/auth/server";
import { safePanel } from "@/lib/auth/policy";
export const dynamic = "force-dynamic";
export default async function Page({searchParams}: {searchParams:Promise<{panel?:string;error?:string}>}) {
  const query = await searchParams;
  return <AuthForm mode="reset" configured={authConfigured()} panel={safePanel(query.panel)} confirmationError={query.error === "confirmation"}/>;
}
