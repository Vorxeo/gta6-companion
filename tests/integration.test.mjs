import { test } from "node:test";
import assert from "node:assert/strict";
import { safePanel, workspacePath, safeDestination, hasActiveSubscription } from "../src/lib/auth/policy.ts";
import { mergeCopy } from "../src/lib/merge-copy.ts";
import { communityCopy } from "../src/lib/community-copy.ts";
import { guideCopy } from "../src/lib/guide-copy.ts";
import { arcadeCopy } from "../src/lib/arcade-copy.ts";
import { labCopy } from "../src/lib/lab-copy.ts";
import { simulate } from "../src/lib/lab-model.ts";

test("workspace redirects accept only known panels", () => {
  assert.equal(safePanel("garage"), "garage");
  assert.equal(safePanel("https://example.com"), "tracker");
  assert.equal(workspacePath("../../pricing"), "/workspace?panel=tracker");
  assert.equal(safeDestination("creator-lab",null), "/creator-lab");
  assert.equal(safeDestination("//example.com","garage"), "/workspace?panel=garage");
});

test("paid access expires and rejects malformed entitlement data", () => {
  const now = Date.parse("2026-09-29T12:00:00Z");
  assert.equal(hasActiveSubscription({status:"trialing",current_period_end:"2026-09-30T00:00:00Z"},now), true);
  assert.equal(hasActiveSubscription({status:"active",current_period_end:"2026-09-29T12:00:00Z"},now), false);
  assert.equal(hasActiveSubscription({status:"canceled",current_period_end:"2026-10-30T00:00:00Z"},now), false);
  assert.equal(hasActiveSubscription({status:"active",current_period_end:"not-a-date"},now), false);
});

test("merged experience has complete text in all three languages", () => {
  for (const bundle of [mergeCopy, communityCopy, guideCopy, arcadeCopy, labCopy]) {
    for (const locale of ["es","pt-BR"]) {
      assert.deepEqual(Object.keys(bundle[locale]).sort(),Object.keys(bundle.en).sort());
    }
  }
  for (const locale of ["en","es","pt-BR"]) {
    assert.equal(guideCopy[locale].topics.length,6);
    assert.ok(communityCopy[locale].warning.length > 12);
  }
});

test("creator lab scenarios respond predictably to route and heat", () => {
  const calm=simulate({crew:2,heat:10,route:"quiet"});
  const loud=simulate({crew:2,heat:90,route:"downtown"});
  assert.ok(calm.chance > loud.chance);
  assert.ok(loud.payout > calm.payout);
  assert.ok(calm.minutes > loud.minutes);
  assert.ok(loud.chance >= 12 && calm.chance <= 96);
});
