// Dữ liệu demo: lấy nguyên lịch tập của data/example-schedule.json rồi dựng 4 tuần log có mức tạ,
// để xem được tổng volume, "% so với tuần trước" và ghost tạ mà không phải tập thật 4 tuần.
// Chạy: node scripts/build-mock-store.mjs  →  data/mock-store.json (import ở tab "Tôi")
import { readFileSync, writeFileSync } from "node:fs";

const WEEKS = 4;
const DAY_INDEX = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };

const here = (p) => new URL(p, import.meta.url);
const { schedule } = JSON.parse(readFileSync(here("../data/example-schedule.json"), "utf8"));

/** Mức tạ khởi điểm bám theo exerciseId — cùng một bài luôn ra cùng con số giữa các lần chạy. */
function baseWeight(exerciseId) {
  const h = [...exerciseId].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  return 10 + (h % 17) * 2.5; // 10 → 50 kg, bước 2.5 như Stepper
}

const monday = new Date();
monday.setHours(18, 0, 0, 0);
monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

const logs = [];
for (let back = WEEKS - 1; back >= 0; back--) {
  for (const [dayKey, day] of Object.entries(schedule.days)) {
    const items = day?.blocks.flatMap((b) => b.items) ?? [];
    if (!items.length) continue;

    const date = new Date(monday);
    date.setDate(date.getDate() - back * 7 + DAY_INDEX[dayKey]);
    if (date > new Date()) continue; // chưa tới ngày thì chưa có log

    const startedAt = date.getTime();
    logs.push({
      id: `mock-${dayKey}-${back}`,
      dateISO: date.toISOString(),
      dayKey,
      dayName: day.name,
      startedAt,
      finishedAt: startedAt + items.length * 8 * 60_000,
      entries: items.map((i) => ({
        exerciseId: i.exerciseId,
        setsDone: i.sets,
        repsDone: Array(i.sets).fill(i.reps),
        // Tăng 2.5kg mỗi tuần: đủ để "% so với tuần trước" ra số dương thấy được.
        weight: baseWeight(i.exerciseId) + (WEEKS - 1 - back) * 2.5,
      })),
    });
  }
}

logs.reverse(); // app đọc logs mới nhất trước
const out = here("../data/mock-store.json");
writeFileSync(out, JSON.stringify({ schedule, logs }, null, 2) + "\n");
console.log(`data/mock-store.json — ${logs.length} buổi tập, ${WEEKS} tuần`);
