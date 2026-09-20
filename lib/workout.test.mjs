// Run with: node --test lib/
import { test } from "node:test";
import assert from "node:assert/strict";
import { completeSet, setItemWeight, startProgress, stepValue } from "./workout.ts";

const item = (exerciseId, sets, restSec = 60) => ({ id: exerciseId, exerciseId, sets, reps: 10, restSec });

test("rests between sets of the same exercise", () => {
  const items = [item("a", 3)];
  const { next, rest, finished } = completeSet(items, startProgress());
  assert.deepEqual(next, { index: 0, setsDone: 1, entries: [] });
  assert.equal(rest, 60);
  assert.equal(finished, false);
});

test("logs the exercise and moves on after its last set", () => {
  const items = [item("a", 2), item("b", 1, 90)];
  let p = startProgress();
  p = completeSet(items, p).next;
  const { next, rest, finished } = completeSet(items, p);
  assert.equal(next.index, 1);
  assert.equal(next.setsDone, 0);
  assert.deepEqual(next.entries, [{ exerciseId: "a", setsDone: 2, repsDone: [10, 10] }]);
  assert.equal(rest, 60, "rest belongs to the exercise just finished, not the next one");
  assert.equal(finished, false);
});

test("finishes without a trailing rest", () => {
  const items = [item("a", 1)];
  const { rest, finished, next } = completeSet(items, startProgress());
  assert.equal(finished, true);
  assert.equal(rest, 0);
  assert.equal(next.entries.length, 1);
});

test("a zero rest carries straight on", () => {
  const items = [item("a", 2, 0)];
  assert.equal(completeSet(items, startProgress()).rest, 0);
});

test("stepValue clamps and keeps 2.5 kg steps exact", () => {
  assert.equal(stepValue(0, 2.5, 0, 500), 2.5);
  assert.equal(stepValue(497.5, 5, 0, 500), 500, "clamps at max");
  assert.equal(stepValue(2.5, -5, 0, 500), 0, "clamps at min");
  assert.equal(stepValue(7.5, 2.5, 0, 500), 10);
});

test("setItemWeight hits only the target item, in whatever block it lives", () => {
  const day = {
    name: "Ngực",
    blocks: [
      { id: "b1", bodyPart: "chest", items: [item("a", 3)] },
      { id: "b2", bodyPart: "back", items: [item("b", 3), item("c", 3)] },
    ],
  };
  const next = setItemWeight(day, "c", 42.5);
  assert.equal(next.blocks[1].items[1].weight, 42.5);
  assert.equal(next.blocks[1].items[0].weight, undefined);
  assert.equal(next.blocks[0].items[0].weight, undefined);
  assert.equal(day.blocks[1].items[1].weight, undefined, "original day is untouched");
  assert.equal(setItemWeight(next, "c", 0).blocks[1].items[1].weight, undefined, "0 clears the weight");
});
