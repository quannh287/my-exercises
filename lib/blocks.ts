import type { Block, BlockKind, Day } from "./types";

// Chỉ import kiểu: node --experimental-strip-types không resolve được import giá trị không có đuôi .ts.
const ORDER: Record<BlockKind, number> = { warmup: 0, main: 1, cooldown: 2 };

/** Luôn hiện đủ 3 phần buổi tập, kể cả khi khối tương ứng chưa tồn tại trong dữ liệu. */
export function sections(day: Day): { kind: BlockKind; block?: Block }[] {
  return [
    { kind: "warmup", block: day.blocks.find((b) => b.kind === "warmup") },
    ...day.blocks.filter((b) => b.kind === "main").map((block) => ({ kind: "main" as const, block })),
    { kind: "cooldown", block: day.blocks.find((b) => b.kind === "cooldown") },
  ];
}

/**
 * Chèn khối mới đúng vị trí: thứ tự trong `blocks` chính là thứ tự runner chạy (flatItems),
 * nên khởi động phải nằm trước và giãn cơ phải nằm cuối.
 */
export function insertBlock(blocks: Block[], block: Block): Block[] {
  const at = blocks.findIndex((b) => ORDER[b.kind] > ORDER[block.kind]);
  return at < 0 ? [...blocks, block] : [...blocks.slice(0, at), block, ...blocks.slice(at)];
}
