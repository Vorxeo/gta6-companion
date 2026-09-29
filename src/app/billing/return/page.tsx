import { authClient } from "@/lib/auth/server";
import { billingAdmin, billingOperational, syncPayment } from "@/lib/billing/server";
import ReturnView from "./ReturnView";
import "../billing.css";
export const dynamic = "force-dynamic";
export default async function BillingReturn({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  let status = "processing";
  const id = (await searchParams).checkout;
  const client = await authClient();
  const { data: { user } } = client ? await client.auth.getUser() : { data: { user: null } };
  if (user?.email_confirmed_at && billingOperational() && id && /^[0-9a-f-]{36}$/i.test(id)) {
    const { data: checkout } = await billingAdmin().from("billing_checkouts").select("payment_id,status")
      .eq("id", id).eq("user_id", user.id).maybeSingle();
    if (checkout?.payment_id) {
      try { status = await syncPayment(checkout.payment_id); } catch { status = checkout.status === "paid" ? "paid" : "processing"; }
    }
  }
  return <ReturnView paid={status === "paid"}/>;
}
