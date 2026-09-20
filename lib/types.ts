export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEK_DAYS: WeekDay[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const DAY_LABEL: Record<WeekDay, string> = {
  mon: "Thứ 2",
  tue: "Thứ 3",
  wed: "Thứ 4",
  thu: "Thứ 5",
  fri: "Thứ 6",
  sat: "Thứ 7",
  sun: "Chủ nhật",
};

export const DAY_SHORT: Record<WeekDay, string> = {
  mon: "T2",
  tue: "T3",
  wed: "T4",
  thu: "T5",
  fri: "T6",
  sat: "T7",
  sun: "CN",
};

/** The list-view slice, served by /data/catalog.json. */
export type Exercise = {
  exerciseId: string;
  /** English, as it comes from ExerciseDB. */
  name: string;
  /** Vietnamese, merged in at build time; falls back to `name`. */
  nameVi: string;
  gifUrl: string;
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
};

/** The heavy per-exercise rest, served by /data/details.json only when one is opened. */
export type Details = { secondaryMuscles: string[]; instructionsVi: string[] };

export type Item = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  restSec: number;
  note?: string;
};

export type Block = { id: string; bodyPart: string; items: Item[] };

/** `null` means a rest day. */
export type Day = { name: string; blocks: Block[] };

export type Schedule = { days: Record<WeekDay, Day | null> };

export type LogEntry = { exerciseId: string; setsDone: number; repsDone: number[] };

export type Log = {
  id: string;
  dateISO: string;
  dayKey: WeekDay;
  dayName: string;
  startedAt: number;
  finishedAt: number;
  entries: LogEntry[];
};

export type Store = { schedule: Schedule; logs: Log[] };

export const todayKey = (d = new Date()): WeekDay => WEEK_DAYS[(d.getDay() + 6) % 7];

export const countItems = (day: Day | null) =>
  day ? day.blocks.reduce((n, b) => n + b.items.length, 0) : 0;

export const flatItems = (day: Day) => day.blocks.flatMap((b) => b.items);
