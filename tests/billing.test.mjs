import { test } from "node:test";
import assert from "node:assert/strict";
import { planFor, periodEnd, matchesFirstPayment, matchesRenewal } from "../src/lib/billing/model.ts";
import { hasActiveSubscription } from "../src/lib/auth/policy.ts";

test("checkout amounts come from the displayed EUR and USD plans", () => {
  assert.deepEqual(planFor("EUR", "monthly"), {currency:"EUR",interval:"monthly",cents:499,value:"4.99",mollieInterval:"1 month"});
  assert.equal(planFor("USD", "annual")?.value, "49.90");
  assert.equal(planFor("BRL", "monthly"), null);
  assert.equal(planFor("EUR", "weekly"), null);
});

test("a paid calendar month handles month-end correctly", () => {
  assert.equal(periodEnd("2026-01-31T15:00:00.000Z","monthly"),"2026-02-28T15:00:00.000Z");
  assert.equal(periodEnd("2024-02-29T15:00:00.000Z","annual"),"2025-02-28T15:00:00.000Z");
});

test("first payment requires server-recorded customer, checkout, amount and paid status", () => {
  const checkout={id:"27aef2b7-730e-46a7-b7ee-799f6fcc96c1",customer_id:"cst_abc",payment_id:"tr_abc",currency:"EUR",amount_cents:499};
  const payment={id:"tr_abc",status:"paid",sequenceType:"first",customerId:"cst_abc",amount:{currency:"EUR",value:"4.99"},metadata:{checkout_id:checkout.id},paidAt:"2026-09-29T12:00:00Z",amountRefunded:{value:"0.00"}};
  assert.equal(matchesFirstPayment(payment,checkout),true);
  assert.equal(matchesFirstPayment({...payment,amount:{currency:"EUR",value:"0.01"}},checkout),false);
  assert.equal(matchesFirstPayment({...payment,customerId:"cst_other"},checkout),false);
  assert.equal(matchesFirstPayment({...payment,status:"open"},checkout),false);
  assert.equal(matchesFirstPayment({...payment,amountRefunded:{value:"4.99"}},checkout),false);
  assert.equal(matchesFirstPayment({...payment,status:"charged_back"},checkout),false);
  assert.equal(matchesFirstPayment({...payment,amountChargedBack:{value:"0.01"}},checkout),false);
  assert.equal(matchesFirstPayment({...payment,amountRefunded:{value:"invalid"}},checkout),false);
});

test("renewal cannot claim another subscription or an underpaid currency", () => {
  const sub={mollie_subscription_id:"sub_abc",mollie_customer_id:"cst_abc",currency:"USD",interval:"annual"};
  const payment={status:"paid",sequenceType:"recurring",subscriptionId:"sub_abc",customerId:"cst_abc",amount:{currency:"USD",value:"49.90"},paidAt:"2026-09-29T12:00:00Z"};
  assert.equal(matchesRenewal(payment,sub),true);
  assert.equal(matchesRenewal({...payment,subscriptionId:"sub_other"},sub),false);
  assert.equal(matchesRenewal({...payment,amount:{currency:"EUR",value:"49.90"}},sub),false);
});

test("Pro access needs Mollie-backed paid time; cancellation ends renewal but not paid access", () => {
  const now=Date.parse("2026-09-29T12:00:00Z");
  assert.equal(hasActiveSubscription({provider:"mollie",status:"active",current_period_end:"2026-10-29T12:00:00Z"},now),true);
  assert.equal(hasActiveSubscription({provider:"mollie",status:"canceled",current_period_end:"2026-10-29T12:00:00Z"},now),true);
  assert.equal(hasActiveSubscription({status:"active",current_period_end:"2026-10-29T12:00:00Z"},now),false);
  assert.equal(hasActiveSubscription({provider:"mollie",status:"active",current_period_end:"2026-09-28T12:00:00Z"},now),false);
});
