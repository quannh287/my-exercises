import type { Day, Item, LogEntry } from "./types";

export type Progress = { index: number; setsDone: number; entries: LogEntry[] };

export type Advance = {
  next: Progress;
  /** Seconds to rest before the next set, or 0 to carry straight on. */
  rest: number;
  finished: boolean;
};

export const startProgress = (): Progress => ({ index: 0, setsDone: 0, entries: [] });

/**
 * Applies one "Xong set" tap. The rest that follows the last set of an exercise
 * belongs to the exercise just finished, not to the one coming up.
 */
export function completeSet(items: Item[], p: Progress): Advance {
  const item = items[p.index];
  if (!item) return { next: p, rest: 0, finished: true };

  const setsDone = p.setsDone + 1;
  if (setsDone < item.sets) {
    return { next: { ...p, setsDone }, rest: item.restSec, finished: false };
  }

  const entries = [
    ...p.entries,
    { exerciseId: item.exerciseId, setsDone: item.sets, repsDone: Array(item.sets).fill(item.reps) },
  ];
  const index = p.index + 1;
  const finished = index >= items.length;
  return { next: { index, setsDone: 0, entries }, rest: finished ? 0 : item.restSec, finished };
}

/** One tap on a Stepper button: add `delta`, clamp, and drop float drift from 2.5 kg steps. */
export const stepValue = (value: number, delta: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round((value + delta) * 10) / 10));

/** The runner only has a flat item list, so the weight has to be found across every block. */
export const setItemWeight = (day: Day, itemId: string, weight: number): Day => ({
  ...day,
  blocks: day.blocks.map((b) => ({
    ...b,
    items: b.items.map((i) => (i.id === itemId ? { ...i, weight: weight || undefined } : i)),
  })),
});
