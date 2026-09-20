import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));

test("example-schedule.json imports cleanly against the catalog", () => {
  const store = read("../data/example-schedule.json");
  const ids = new Set(read("../data/exercises.json").exercises.map((e) => e.exerciseId));

  assert.ok(store.schedule?.days, "importJson() rejects a payload without schedule.days");
  assert.equal(Object.keys(store.schedule.days).length, 7);

  for (const day of Object.values(store.schedule.days)) {
    if (!day) continue;
    for (const block of day.blocks) {
      for (const item of block.items) {
        assert.ok(ids.has(item.exerciseId), `unknown exerciseId ${item.exerciseId}`);
        assert.ok(item.sets > 0 && item.reps > 0 && item.restSec > 0);
      }
    }
  }

  for (const log of store.logs) {
    assert.ok(store.schedule.days[log.dayKey], `log ${log.id} points at a rest day`);
    for (const e of log.entries) assert.equal(e.repsDone.length, e.setsDone);
  }
});
