// Run with: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { isDue } from "./types.ts";

const r = { enabled: true, time: "18:00", leadMin: 30 };
const at = (h, m) => new Date(2026, 0, 5, h, m);

test("fires from lead time until the window closes", () => {
  assert.equal(isDue(r, at(17, 29)), false);
  assert.equal(isDue(r, at(17, 30)), true);
  assert.equal(isDue(r, at(18, 15)), true);
  assert.equal(isDue(r, at(18, 16)), false);
});

test("lead before midnight clamps instead of wrapping to the day before", () => {
  assert.equal(isDue({ ...r, time: "00:10" }, at(0, 0)), true);
});
