import { prices } from "../pricing.ts";

export type PaidCurrency = "EUR" | "USD" | "BRL";
export type BillingInterval = "monthly" | "annual";
export type CheckoutRecord = { id:string; customer_id:string; payment_id:string|null; currency:PaidCurrency; interval:BillingInterval; amount_cents:number };
export type SubscriptionRecord = { mollie_subscription_id:string; mollie_customer_id:string; currency:PaidCurrency; interval:BillingInterval };
export type MolliePayment = { id:string; status:string; sequenceType?:string; customerId?:string; subscriptionId?:string; amount:{currency:string;value:string}; metadata?:unknown; paidAt?:string|null; amountRefunded?:{value:string}|null; amountChargedBack?:{value:string}|null };

export function planFor(currency:unknown, interval:unknown) {
  if ((currency!=="EUR"&&currency!=="USD"&&currency!=="BRL") || (interval!=="monthly"&&interval!=="annual")) return null;
  const cents=prices[currency][interval];
  return {currency,interval,cents,value:(cents/100).toFixed(2),mollieInterval:interval==="monthly"?"1 month":"12 months",method:currency==="BRL"?"paypal":"creditcard"} as const;
}

export function periodEnd(iso:string, interval:BillingInterval):string {
  const date=new Date(iso);
  if(!Number.isFinite(date.getTime())) throw new Error("Invalid paidAt");
  const years=interval==="annual"?1:0, months=interval==="monthly"?1:0;
  const targetMonth=date.getUTCMonth()+months;
  const year=date.getUTCFullYear()+years+Math.floor(targetMonth/12);
  const month=targetMonth%12;
  const lastDay=new Date(Date.UTC(year,month+1,0)).getUTCDate();
  return new Date(Date.UTC(year,month,Math.min(date.getUTCDate(),lastDay),date.getUTCHours(),date.getUTCMinutes(),date.getUTCSeconds(),date.getUTCMilliseconds())).toISOString();
}

function metadataCheckout(value:unknown):string|null {
  try { const data=typeof value==="string"?JSON.parse(value):value;return data && typeof data==="object" && typeof (data as Record<string,unknown>).checkout_id==="string"?(data as Record<string,string>).checkout_id:null; } catch { return null; }
}
function netPaid(payment:MolliePayment) {
  return payment.status==="paid" && !!payment.paidAt && Number.isFinite(Date.parse(payment.paidAt)) && !isReversed(payment);
}
export function isReversed(payment:MolliePayment) {
  const amounts = [payment.amountRefunded?.value ?? "0.00", payment.amountChargedBack?.value ?? "0.00"];
  return ["refunded","charged_back"].includes(payment.status) || amounts.some(value =>
    !/^\d+\.\d{2}$/.test(value) || Number(value) > 0);
}
export function matchesFirstPayment(payment:MolliePayment, checkout:CheckoutRecord) {
  return netPaid(payment) && payment.sequenceType==="first" && payment.id===checkout.payment_id && payment.customerId===checkout.customer_id && metadataCheckout(payment.metadata)===checkout.id && payment.amount.currency===checkout.currency && payment.amount.value===(checkout.amount_cents/100).toFixed(2);
}
export function matchesRenewal(payment:MolliePayment, subscription:SubscriptionRecord) {
  const plan=planFor(subscription.currency,subscription.interval);
  return !!plan && netPaid(payment) && payment.sequenceType==="recurring" && payment.subscriptionId===subscription.mollie_subscription_id && payment.customerId===subscription.mollie_customer_id && payment.amount.currency===plan.currency && payment.amount.value===plan.value;
}
