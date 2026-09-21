// Run with: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BODY_PARTS, MUSCLE_GROUP, groupsOf } from "../scripts/muscle-groups.mjs";

const { exercises } = JSON.parse(readFileSync(new URL("../data/exercises.json", import.meta.url), "utf8"));

test("mọi primaryMuscle trong dataset đều map được sang một nhóm cơ", () => {
  const seen = new Set(exercises.flatMap((e) => e.targetMuscles));
  const missing = [...seen].filter((m) => !(m in MUSCLE_GROUP));
  assert.deepEqual(missing, [], "thiếu map = bài đó rơi khỏi mọi bộ lọc, âm thầm");
});

test("mọi nhóm cơ đều có bài, và không bài nào rỗng nhóm", () => {
  const used = new Set(exercises.flatMap((e) => e.bodyParts));
  assert.deepEqual([...used].sort(), [...BODY_PARTS].sort());
  assert.equal(exercises.filter((e) => !e.bodyParts.length).length, 0);
});

test("groupsOf gộp trùng và giữ thứ tự cố định", () => {
  assert.deepEqual(groupsOf(["biceps", "triceps"]), ["arms"]);
  assert.deepEqual(groupsOf(["abdominals", "chest"]), ["chest", "core"]);
  assert.deepEqual(groupsOf(["không có thật"]), []);
});
