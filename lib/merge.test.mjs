// Run with: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { merge, sameStore } from "./merge.ts";

const days = (name) => ({ mon: name ? { name, blocks: [] } : null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null });
const log = (id, finishedAt) => ({ id, dateISO: "2026-09-25", dayKey: "mon", dayName: "d", startedAt: 0, finishedAt, entries: [] });
const store = (o) => ({ schedule: { days: days(null) }, logs: [], epoch: 0, scheduleAt: 0, ...o });

test("hợp log hai máy, không mất buổi nào, mới nhất lên đầu", () => {
  const a = store({ logs: [log("a", 3), log("x", 1)] });
  const b = store({ logs: [log("b", 2), log("x", 1)] });
  assert.deepEqual(merge(a, b).logs.map((l) => l.id), ["a", "b", "x"]);
});

test("lịch lấy bản sửa sau cùng", () => {
  const a = store({ schedule: { days: days("A") }, scheduleAt: 5 });
  const b = store({ schedule: { days: days("B") }, scheduleAt: 9 });
  assert.equal(merge(a, b).schedule.days.mon.name, "B");
  assert.equal(merge(b, a).schedule.days.mon.name, "B");
});

test("xoá dữ liệu (epoch mới) không bị máy cũ hợp log trở lại", () => {
  const cleared = store({ epoch: 10 });
  const stale = store({ logs: [log("old", 1)] });
  assert.equal(merge(stale, cleared).logs.length, 0);
  assert.equal(merge(cleared, stale).logs.length, 0);
});

test("coi là giống nhau dù thứ tự key khác (jsonb sắp lại key)", () => {
  const a = store({ logs: [log("a", 1)] });
  const shuffled = { scheduleAt: 0, epoch: 0, logs: a.logs, schedule: { days: { sun: null, ...a.schedule.days } } };
  assert.ok(sameStore(a, shuffled));
  assert.ok(!sameStore(a, store()));
});
