// Run with: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { search } from "./exercises.ts";

const ex = (exerciseId, nameVi, level, kind = "main") => ({
  exerciseId,
  name: exerciseId,
  nameVi,
  imageUrls: [],
  bodyParts: ["chest"],
  equipments: ["barbell"],
  targetMuscles: ["chest"],
  level,
  kind,
});

const catalog = {
  exercises: [ex("hard", "Đẩy ngực khó", 3), ex("easy", "Đẩy ngực dễ", 1), ex("gian", "Giãn ngực", 1, "stretch")],
  byId: new Map(),
  taxonomy: { bodyParts: [], muscles: [], equipments: [] },
};
const ids = (f) => search(catalog, f).map((e) => e.exerciseId);

test("mặc định chỉ trả bài chính, xếp dễ trước khó", () => {
  assert.deepEqual(ids({}), ["easy", "hard"]);
});

test("kind khoá danh sách vào đúng loại bài", () => {
  assert.deepEqual(ids({ kind: "stretch" }), ["gian"]);
});

test("lọc theo cấp độ", () => {
  assert.deepEqual(ids({ levels: [3] }), ["hard"]);
  assert.deepEqual(ids({ levels: [1, 3] }), ["easy", "hard"]);
});

test("đang gõ tìm thì bỏ qua lọc cấp độ, không thì tưởng app thiếu bài", () => {
  assert.deepEqual(ids({ q: "kho", levels: [1] }), ["hard"]);
});

test("tìm được cả tên tiếng Anh lẫn tiếng Việt không dấu", () => {
  assert.deepEqual(ids({ q: "EASY" }), ["easy"]);
  assert.deepEqual(ids({ q: "day nguc de" }), ["easy"]);
});
