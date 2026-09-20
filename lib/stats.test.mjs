// Run with: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateMinutes, historyStats, lastWeight, logVolume, volumeDelta, weekProgress, weekStart } from "./stats.ts";

const WEEK = 7 * 86_400_000;
const log = (dateISO, dayKey, minutes = 50) => ({
  id: dateISO,
  dateISO,
  dayKey,
  dayName: "x",
  startedAt: 0,
  finishedAt: minutes * 60_000,
  entries: [],
});

const day = (items) => ({ name: "d", blocks: [{ id: "b", bodyPart: "back", items }] });

test("weekStart snaps to Monday regardless of the weekday", () => {
  const monday = weekStart(new Date("2026-09-14T10:00:00"));
  assert.equal(monday.getDay(), 1);
  assert.equal(weekStart(new Date("2026-09-20T23:00:00")).getTime(), monday.getTime()); // Sunday
});

test("weekProgress counts one day once and ignores older logs", () => {
  const now = new Date("2026-09-16T12:00:00");
  const thisWeek = new Date("2026-09-15T08:00:00").toISOString();
  const lastWeek = new Date("2026-09-08T08:00:00").toISOString();
  const schedule = { days: { mon: day([1]), tue: day([1]), wed: null, thu: null, fri: null, sat: null, sun: null } };

  const p = weekProgress(schedule, [log(thisWeek, "tue"), log(thisWeek, "tue"), log(lastWeek, "mon")], now);
  assert.deepEqual([p.planned, p.done, p.pct], [2, 1, 50]);
});

test("streak survives a quiet current week but breaks on a gap", () => {
  const now = new Date("2026-09-16T12:00:00");
  const at = (weeksAgo) => new Date(now.getTime() - weeksAgo * WEEK).toISOString();

  assert.equal(historyStats([log(at(1), "mon"), log(at(2), "mon")], now).streakWeeks, 2);
  assert.equal(historyStats([log(at(1), "mon"), log(at(3), "mon")], now).streakWeeks, 1);
});

test("estimateMinutes scales with sets and rest", () => {
  const items = [{ id: "i", exerciseId: "e", sets: 3, reps: 10, restSec: 60 }];
  assert.equal(estimateMinutes(day(items)), 5); // 3 × 100s
  assert.equal(estimateMinutes(null), 0);
});

const vlog = (id, dateISO, dayKey, entries) => ({ ...log(dateISO, dayKey), id, entries });
const entry = (exerciseId, repsDone, weight) => ({ exerciseId, setsDone: repsDone.length, repsDone, weight });

test("logVolume sums weight × reps, bodyweight counts as 0", () => {
  assert.equal(logVolume(vlog("a", "2026-09-14T08:00:00.000Z", "mon", [entry("e", [10, 8], 20), entry("bw", [10])])), 360);
});

test("volumeDelta compares with the same weekday's previous session", () => {
  const prev = vlog("p", "2026-09-07T08:00:00.000Z", "mon", [entry("e", [10], 10)]);
  const cur = vlog("c", "2026-09-14T08:00:00.000Z", "mon", [entry("e", [10], 12)]);
  const other = vlog("o", "2026-09-08T08:00:00.000Z", "tue", [entry("e", [10], 100)]);

  assert.equal(volumeDelta([cur, other, prev], cur), 20);
  assert.equal(volumeDelta([cur], cur), null); // no earlier session
  assert.equal(volumeDelta([cur, vlog("z", "2026-09-07T08:00:00.000Z", "mon", [entry("e", [10])])], cur), null); // base 0
});

test("lastWeight finds the newest weighted log and skips the excluded one", () => {
  const older = vlog("o", "2026-09-07T08:00:00.000Z", "mon", [entry("e", [10], 15)]);
  const newer = vlog("n", "2026-09-14T08:00:00.000Z", "mon", [entry("e", [10], 25)]);

  assert.equal(lastWeight([older, newer], "e"), 25);
  assert.equal(lastWeight([older, newer], "e", "n"), 15);
  assert.equal(lastWeight([older, newer], "nope"), undefined);
});
