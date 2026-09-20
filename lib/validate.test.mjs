// Run with: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateStore, WEEK_DAYS } from "./types.ts";

const good = JSON.parse(readFileSync(new URL("../data/example-schedule.json", import.meta.url), "utf8"));

test("nhận đúng bản sao lưu thật", () => {
  const store = validateStore(good);
  assert.equal(Object.keys(store.schedule.days).length, 7);
  assert.equal(store.logs.length, good.logs.length);
});

test("từ chối mọi payload hỏng thay vì ghi đè dữ liệu", () => {
  const bad = [
    null,
    "chuỗi",
    {},
    { schedule: {} },
    { schedule: { days: "pwned" } },
    { schedule: { days: { mon: "pwned" } } },
    { schedule: { days: { mon: { name: "x", blocks: {} } } } },
    { schedule: { days: { mon: { name: "x", blocks: [{ id: "b", bodyPart: "chest", items: [{}] }] } } } },
    { schedule: { days: {} }, logs: "x" },
    { schedule: { days: {} }, logs: [{ id: "1", dateISO: "HACK", dayKey: "mon", dayName: "d", startedAt: 0, finishedAt: 1, entries: [] }] },
    { schedule: { days: {} }, logs: [{ id: "1", dateISO: "2026-01-01", dayKey: "hacker", dayName: "d", startedAt: 0, finishedAt: 1, entries: [] }] },
    { schedule: { days: {} }, logs: [{ id: "1", dateISO: "2026-01-01", dayKey: "mon", dayName: "d", startedAt: 0, finishedAt: 1, entries: null }] },
  ];
  for (const payload of bad) {
    assert.throws(() => validateStore(payload), `lẽ ra phải chặn: ${JSON.stringify(payload)}`);
  }
});

test("bỏ key lạ, ngày thiếu thành ngày nghỉ", () => {
  const store = validateStore({ schedule: { days: { hacker: { name: "x", blocks: [] } } } });
  assert.deepEqual(Object.keys(store.schedule.days), WEEK_DAYS);
  assert.equal(store.schedule.days.mon, null);
});

test("giữ mức tạ và ghi chú, số âm bị chặn", () => {
  const day = (item) => ({ schedule: { days: { mon: { name: "d", blocks: [{ id: "b", bodyPart: "chest", items: [item] }] } } } });
  const base = { id: "i", exerciseId: "e", sets: 3, reps: 10, restSec: 60 };
  assert.equal(validateStore(day({ ...base, weight: 42.5 })).schedule.days.mon.blocks[0].items[0].weight, 42.5);
  assert.throws(() => validateStore(day({ ...base, weight: -1 })));
  assert.throws(() => validateStore(day({ ...base, sets: 0 })));
});
