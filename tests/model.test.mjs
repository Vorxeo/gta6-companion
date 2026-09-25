import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readData,
  initialData,
  splitSession,
  taskTitle,
  normalizeText,
} from "../src/lib/model.ts";
import { en, es, pt, browserLocale } from "../src/lib/i18n.ts";

test("migrates existing objectives and vehicle strings without losing content", () => {
  const data = readData({
    tasks: [{ text: "Explorar a costa", done: true }],
    cars: ["Comet"],
  });
  assert.equal(data.version, 2);
  assert.equal(data.tasks[0].text, "Explorar a costa");
  assert.equal(data.tasks[0].done, true);
  assert.equal(data.cars[0].name, "Comet");
  assert.equal(data.cars[0].status, "wishlist");
  assert.notEqual(data.tasks[0].id, data.cars[0].id);
});
test("round-trips a complete backup with stable identifiers and plans", () => {
  const data = {
    ...initialData,
    minutes: 90,
    focus: "collection",
    tasks: [
      {
        id: "t1",
        text: "Session 90",
        done: false,
        category: "collection",
        plan: { minutes: 90, focus: "collection" },
      },
    ],
    cars: [
      {
        id: "v1",
        name: "Dream ride",
        type: "classic",
        status: "owned",
        favorite: true,
      },
    ],
  };
  assert.deepEqual(readData(JSON.parse(JSON.stringify(data))), data);
});
test("rejects invalid backups before replacing data", () => {
  for (const value of [
    null,
    {},
    { ...initialData, version: 3 },
    { ...initialData, minutes: 0 },
    { ...initialData, focus: "unknown" },
    {
      ...initialData,
      cars: [
        { id: "x", name: "x", type: "sports", status: "bad", favorite: true },
      ],
    },
    {
      ...initialData,
      tasks: [
        {
          id: "x",
          text: "x",
          done: false,
          category: "collection",
          plan: { minutes: -1, focus: "collection" },
        },
      ],
    },
    {
      ...initialData,
      tasks: Array.from({ length: 501 }, () => ({ text: "x", done: false })),
    },
  ])
    assert.throws(() => readData(value));
});
test("rejects duplicate ids and malformed entries", () => {
  assert.throws(() =>
    readData({
      ...initialData,
      tasks: [
        { id: "x", text: "a", done: false, category: "exploration" },
        { id: "x", text: "b", done: true, category: "collection" },
      ],
    }),
  );
  assert.throws(() =>
    readData({ tasks: [{ text: "", done: true }], cars: [] }),
  );
});
test("all supported session lengths allocate every minute exactly once", () => {
  for (let n = 15; n <= 180; n += 15) {
    const parts = splitSession(n);
    assert.equal(
      parts.reduce((a, b) => a + b, 0),
      n,
    );
    assert.ok(parts.every((x) => x > 0));
  }
});
test("all locales have complete nonempty messages and preserve custom user text", () => {
  for (const locale of [es, pt]) {
    assert.deepEqual(Object.keys(locale).sort(), Object.keys(en).sort());
    assert.ok(
      Object.values(locale).every((x) => typeof x === "string" && x.length),
    );
  }
  const plan = {
    id: "t",
    text: "Session 60",
    done: false,
    category: "exploration",
    plan: { minutes: 60, focus: "exploration" },
  };
  assert.equal(taskTitle(plan, es), "Sesión · 60 min · Exploración");
  assert.equal(taskTitle(plan, pt), "Sessão · 60 min · Exploração");
  assert.equal(
    taskTitle({ ...plan, plan: undefined, text: "Meu próprio texto" }, en),
    "Meu próprio texto",
  );
});
test("browser locale and duplicate matching are predictable", () => {
  assert.equal(browserLocale("pt-PT"), "pt-BR");
  assert.equal(browserLocale("es-MX"), "es");
  assert.equal(browserLocale("fr"), "en");
  assert.equal(normalizeText("  NEON   Ride "), normalizeText("neon ride"));
});
