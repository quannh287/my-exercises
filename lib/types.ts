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
  /** Kilograms. Optional so schedules saved before this field still parse. */
  weight?: number;
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

class BadBackup extends Error {
  constructor(where: string) {
    super(`File sao lưu hỏng ở ${where}`);
  }
}

const str = (v: unknown, where: string) => {
  if (typeof v !== "string" || !v) throw new BadBackup(where);
  return v;
};

const num = (v: unknown, where: string, min: number) => {
  if (typeof v !== "number" || !Number.isFinite(v) || v < min) throw new BadBackup(where);
  return v;
};

const obj = (v: unknown, where: string): Record<string, unknown> => {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new BadBackup(where);
  return v as Record<string, unknown>;
};

const arr = (v: unknown, where: string): unknown[] => {
  if (!Array.isArray(v)) throw new BadBackup(where);
  return v;
};

function readItem(raw: unknown, where: string): Item {
  const o = obj(raw, where);
  return {
    id: str(o.id, `${where}.id`),
    exerciseId: str(o.exerciseId, `${where}.exerciseId`),
    sets: num(o.sets, `${where}.sets`, 1),
    reps: num(o.reps, `${where}.reps`, 1),
    restSec: num(o.restSec, `${where}.restSec`, 0),
    ...(o.weight === undefined ? {} : { weight: num(o.weight, `${where}.weight`, 0) }),
    ...(o.note === undefined ? {} : { note: str(o.note, `${where}.note`) }),
  };
}

function readDay(raw: unknown, where: string): Day | null {
  if (raw === null || raw === undefined) return null;
  const o = obj(raw, where);
  return {
    name: str(o.name, `${where}.name`),
    blocks: arr(o.blocks, `${where}.blocks`).map((b, i) => {
      const block = obj(b, `${where}.blocks[${i}]`);
      return {
        id: str(block.id, `${where}.blocks[${i}].id`),
        bodyPart: str(block.bodyPart, `${where}.blocks[${i}].bodyPart`),
        items: arr(block.items, `${where}.blocks[${i}].items`).map((it, j) =>
          readItem(it, `${where}.blocks[${i}].items[${j}]`),
        ),
      };
    }),
  };
}

function readLog(raw: unknown, where: string): Log {
  const o = obj(raw, where);
  const dateISO = str(o.dateISO, `${where}.dateISO`);
  if (Number.isNaN(new Date(dateISO).getTime())) throw new BadBackup(`${where}.dateISO`);
  const dayKey = str(o.dayKey, `${where}.dayKey`) as WeekDay;
  if (!WEEK_DAYS.includes(dayKey)) throw new BadBackup(`${where}.dayKey`);
  return {
    id: str(o.id, `${where}.id`),
    dateISO,
    dayKey,
    dayName: str(o.dayName, `${where}.dayName`),
    startedAt: num(o.startedAt, `${where}.startedAt`, 0),
    finishedAt: num(o.finishedAt, `${where}.finishedAt`, 0),
    entries: arr(o.entries, `${where}.entries`).map((e, i) => {
      const entry = obj(e, `${where}.entries[${i}]`);
      return {
        exerciseId: str(entry.exerciseId, `${where}.entries[${i}].exerciseId`),
        setsDone: num(entry.setsDone, `${where}.entries[${i}].setsDone`, 0),
        repsDone: arr(entry.repsDone, `${where}.entries[${i}].repsDone`).map((r, j) =>
          num(r, `${where}.entries[${i}].repsDone[${j}]`, 0),
        ),
      };
    }),
  };
}

/**
 * Dựng lại Store từ dữ liệu lạ (file backup, localStorage hỏng) — ném lỗi thay vì trả về
 * thứ nửa vời, vì dữ liệu sai được ghi xuống máy sẽ làm app crash ở mọi lần mở sau.
 * Chỉ giữ đúng 7 key ngày; key lạ bị bỏ.
 */
export function validateStore(input: unknown): Store {
  const root = obj(input, "gốc file");
  const days = obj(obj(root.schedule, "schedule").days, "schedule.days");
  return {
    schedule: {
      days: Object.fromEntries(
        WEEK_DAYS.map((d) => [d, readDay(days[d], `schedule.days.${d}`)]),
      ) as Schedule["days"],
    },
    logs: (root.logs === undefined ? [] : arr(root.logs, "logs")).map((l, i) => readLog(l, `logs[${i}]`)),
  };
}
