// Run with: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { insertBlock, sections } from "./blocks.ts";
import { flatItems } from "./types.ts";

const b = (id, kind, items = []) => ({ id, kind, items });

test("luôn có đủ 3 phần, kể cả ngày chưa có khối nào", () => {
  assert.deepEqual(
    sections({ name: "d", blocks: [] }).map((s) => [s.kind, s.block]),
    [["warmup", undefined], ["cooldown", undefined]],
  );
});

test("nhiều khối bài chính nằm giữa khởi động và giãn cơ", () => {
  const day = { name: "d", blocks: [b("c", "cooldown"), b("m1", "main"), b("m2", "main"), b("w", "warmup")] };
  assert.deepEqual(
    sections(day).map((s) => s.block?.id ?? s.kind),
    ["w", "m1", "m2", "c"],
  );
});

test("insertBlock giữ thứ tự khởi động → chính → giãn cơ", () => {
  let bs = [];
  for (const [id, kind] of [["c", "cooldown"], ["m1", "main"], ["w", "warmup"], ["m2", "main"]]) {
    bs = insertBlock(bs, b(id, kind));
  }
  assert.deepEqual(bs.map((x) => x.id), ["w", "m1", "m2", "c"]);
});

test("thứ tự khối quyết định thứ tự runner chạy", () => {
  let bs = [];
  bs = insertBlock(bs, b("c", "cooldown", [{ id: "gian" }]));
  bs = insertBlock(bs, b("m", "main", [{ id: "chinh" }]));
  bs = insertBlock(bs, b("w", "warmup", [{ id: "khoi-dong" }]));
  assert.deepEqual(flatItems({ name: "d", blocks: bs }).map((i) => i.id), ["khoi-dong", "chinh", "gian"]);
});
