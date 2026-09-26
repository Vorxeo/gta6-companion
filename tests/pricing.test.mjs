import { test } from "node:test";
import assert from "node:assert/strict";
import { prices, formatPrice, pricingCopy } from "../src/lib/pricing.ts";

test("proposed annual totals equal ten monthly payments in every currency", () => {
  for (const offer of Object.values(prices)) {
    assert.ok(Number.isInteger(offer.monthly) && offer.monthly > 0);
    assert.equal(offer.annual, offer.monthly * 10);
    assert.equal(offer.monthly * 12 - offer.annual, offer.monthly * 2);
  }
});

test("currency amounts preserve cents and locale formatting", () => {
  assert.match(formatPrice(1990, "BRL", "pt-BR"), /19,90/);
  assert.match(formatPrice(4990, "USD", "en"), /49\.90/);
  assert.match(formatPrice(499, "EUR", "es"), /4,99/);
});

test("pricing languages include matching feature comparisons and FAQs", () => {
  for (const copy of Object.values(pricingCopy)) {
    assert.deepEqual(Object.keys(copy).sort(), Object.keys(pricingCopy.en).sort());
    assert.equal(copy.rows.length, 6);
    assert.equal(copy.freeFeatures.length, 5);
    assert.equal(copy.proFeatures.length, 4);
    assert.equal(copy.benefits.length, 3);
    assert.equal(copy.questions.length, 5);
    assert.ok(copy.notice.length > 0 && copy.proNote.length > 0);
  }
});
