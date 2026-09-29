import PricingClient from "./PricingClient";
import { billingConfigured, checkoutConfiguredFor } from "@/lib/billing/server";
export const dynamic = "force-dynamic";
function legalUrl(value: string | undefined) {
  try { const url = new URL(value || ""); return url.protocol === "https:" ? url.toString() : ""; } catch { return ""; }
}
export default async function PricingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return <PricingClient available={billingConfigured()} brlAvailable={checkoutConfiguredFor("BRL")} terms={legalUrl(process.env.MOLLIE_TERMS_URL)}
    privacy={legalUrl(process.env.MOLLIE_PRIVACY_URL)} error={query.error || ""} />;
}
