import type { Day, Log, Schedule, WeekDay } from "./types";

const plannedDays = (s: Schedule) =>
  Object.values(s.days).filter((d) => d?.blocks.some((b) => b.items.length)).length;

/** Monday 00:00 of the week containing `d` — the schedule repeats Mon→Sun. */
export function weekStart(d = new Date()): Date {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

export type WeekProgress = { planned: number; done: number; pct: number; doneDays: Set<WeekDay> };

export function weekProgress(schedule: Schedule, logs: Log[], now = new Date()): WeekProgress {
  const planned = plannedDays(schedule);
  const from = weekStart(now).getTime();
  const doneDays = new Set(
    logs.filter((l) => new Date(l.dateISO).getTime() >= from).map((l) => l.dayKey),
  );
  const done = Math.min(doneDays.size, planned);
  return { planned, done, pct: planned ? Math.round((done / planned) * 100) : 0, doneDays };
}

export const logMinutes = (l: Log) => Math.max(1, Math.round((l.finishedAt - l.startedAt) / 60000));

export const logSets = (l: Log) => l.entries.reduce((n, e) => n + e.setsDone, 0);

/**
 * ponytail: rest + ~40s of work per set. Rough, but beats showing no estimate at all;
 * swap for measured per-exercise averages from the logs if it ever matters.
 */
export function estimateMinutes(day: Day | null): number {
  if (!day) return 0;
  const seconds = day.blocks
    .flatMap((b) => b.items)
    .reduce((s, i) => s + i.sets * (i.restSec + 40), 0);
  return Math.max(1, Math.round(seconds / 60));
}

export type HistoryStats = { total: number; perWeek: number; avgMinutes: number; streakWeeks: number };

export function historyStats(logs: Log[], now = new Date()): HistoryStats {
  if (!logs.length) return { total: 0, perWeek: 0, avgMinutes: 0, streakWeeks: 0 };

  const weeks = new Set(logs.map((l) => weekStart(new Date(l.dateISO)).getTime()));
  const avgMinutes = Math.round(logs.reduce((n, l) => n + logMinutes(l), 0) / logs.length);

  // Streak runs back from this week; a quiet current week still keeps last week's streak alive.
  const current = weekStart(now).getTime();
  const WEEK_MS = 7 * 86_400_000;
  let streakWeeks = 0;
  let cursor = weeks.has(current) ? current : current - WEEK_MS;
  while (weeks.has(cursor)) {
    streakWeeks += 1;
    cursor -= WEEK_MS;
  }

  return {
    total: logs.length,
    perWeek: Math.round((logs.length / weeks.size) * 10) / 10,
    avgMinutes,
    streakWeeks,
  };
}
