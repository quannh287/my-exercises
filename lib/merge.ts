import type { Store } from "./types";

/**
 * Gộp bản trên máy với bản trên cloud. Log chỉ thêm chứ không sửa, nên hợp theo `id` là không mất buổi nào;
 * lịch thì lấy bản sửa sau cùng. Xoá/nhập file đổi `epoch`, và epoch mới hơn thắng trọn — nếu không, máy kia
 * sẽ hợp lại đúng những log vừa bị xoá.
 */
export function merge(local: Store, remote: Store): Store {
  if (local.epoch !== remote.epoch) return local.epoch > remote.epoch ? local : remote;
  const byId = new Map(remote.logs.map((l) => [l.id, l]));
  for (const l of local.logs) byId.set(l.id, l);
  const logs = [...byId.values()].sort((a, b) => b.finishedAt - a.finishedAt);
  const newer = local.scheduleAt >= remote.scheduleAt ? local : remote;
  return { schedule: newer.schedule, scheduleAt: newer.scheduleAt, logs, epoch: local.epoch };
}

// jsonb của Postgres trả key đã sắp lại, nên phải so theo key đã sắp — so chuỗi thô sẽ luôn lệch.
const sortKeys = (_: string, v: unknown) =>
  v && typeof v === "object" && !Array.isArray(v)
    ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1)))
    : v;
const canonical = (s: Store) => JSON.stringify(s, sortKeys);
export const sameStore = (a: Store, b: Store) => canonical(a) === canonical(b);
