import { test } from "node:test";
import assert from "node:assert/strict";
import { suggestedCurrency } from "../src/lib/currency-choice.ts";

test("country overrides language when suggesting a currency", () => {
  assert.equal(suggestedCurrency("BR", "en"), "BRL");
  assert.equal(suggestedCurrency("US", "nl"), "USD");
  assert.equal(suggestedCurrency("NL", "pt-BR"), "EUR");
  assert.equal(suggestedCurrency("ES", "en"), "EUR");
  assert.equal(suggestedCurrency("BG", "en"), "EUR");
});

test("language supplies a fallback when country is unavailable", () => {
  assert.equal(suggestedCurrency(null, "en"), "EUR");
  assert.equal(suggestedCurrency(null, "es"), "EUR");
  assert.equal(suggestedCurrency(null, "nl"), "EUR");
  assert.equal(suggestedCurrency(null, "pt-BR"), "BRL");
});
