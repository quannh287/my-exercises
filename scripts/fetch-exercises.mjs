// Tải nguyên bundle yuhonas/free-exercise-db về data/, để app không bao giờ gọi mạng lúc chạy.
// Chạy: pnpm data:fetch
import { writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { groupsOf, MUSCLE_GROUP } from "./muscle-groups.mjs";

// Pin theo commit: nhánh main là mutable, upstream đổi ảnh một phát là cả catalog lệch mà không ai hay.
const REF = "a859101d633a01c4a1a920d6a8ce41dabba0705f";
const CDN = `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@${REF}`;
const MAX_ATTEMPTS = 5;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function get(url, attempt = 1) {
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    // 4xx là lỗi vĩnh viễn (sai ref, sai đường dẫn) — thử lại chỉ tốn thời gian.
    if (res.status >= 400 && res.status < 500) {
      throw Object.assign(new Error(`HTTP ${res.status} ${url}`), { fatal: true });
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err.fatal || attempt >= MAX_ATTEMPTS) throw err;
    const wait = 1000 * 2 ** (attempt - 1);
    console.warn(`  retry ${attempt}/${MAX_ATTEMPTS} sau ${wait}ms — ${err.message} (${Date.now() - started}ms)`);
    await new Promise((r) => setTimeout(r, wait));
    return get(url, attempt + 1);
  }
}

const LEVEL = { beginner: 1, intermediate: 2, expert: 3 };
const KIND = { stretching: "stretch", cardio: "warmup", plyometrics: "warmup" };

/** Kiểm trước khi ghi đè: một payload lạ mà ghi đè mất file đang có thì phải fetch lại cả bundle. */
function check(raw) {
  if (!Array.isArray(raw) || raw.length < 500) {
    throw new Error(`Payload không giống catalog (${Array.isArray(raw) ? `${raw.length} phần tử` : typeof raw})`);
  }
  const unknown = new Set();
  for (const e of raw) {
    if (!e.id || !e.name || !Array.isArray(e.primaryMuscles)) throw new Error(`Bài thiếu field bắt buộc: ${e.id ?? "?"}`);
    if (!(e.level in LEVEL)) throw new Error(`Level lạ "${e.level}" ở ${e.id}`);
    for (const m of e.primaryMuscles) if (!(m in MUSCLE_GROUP)) unknown.add(m);
  }
  // Upstream thêm một nhóm cơ mới mà bảng map chưa có = bài đó rơi khỏi mọi bộ lọc, im lặng.
  if (unknown.size) throw new Error(`primaryMuscles chưa map trong muscle-groups.mjs: ${[...unknown].join(", ")}`);
}

const raw = await get(`${CDN}/dist/exercises.json`);
check(raw);

const exercises = [];
let noImage = 0;
for (const e of raw) {
  if (!e.images?.length) {
    noImage++;
    continue; // không có ảnh thì người dùng chọn phải cũng không biết động tác ra sao
  }
  exercises.push({
    exerciseId: e.id,
    name: e.name,
    imageUrls: e.images.map((p) => `${CDN}/exercises/${p}`),
    bodyParts: groupsOf(e.primaryMuscles),
    equipments: [e.equipment ?? "other"],
    targetMuscles: e.primaryMuscles,
    secondaryMuscles: e.secondaryMuscles ?? [],
    instructions: (e.instructions ?? []).map((i) => i.trim()).filter(Boolean),
    level: LEVEL[e.level],
    kind: KIND[e.category] ?? "main",
    category: e.category,
    mechanic: e.mechanic ?? null,
    force: e.force ?? null,
  });
}

const uniq = (key) => [...new Set(exercises.flatMap((e) => e[key]))].sort();
const taxonomy = {
  fetchedAt: new Date().toISOString(),
  source: `yuhonas/free-exercise-db@${REF}`,
  bodyParts: uniq("bodyParts"),
  muscles: [...new Set(exercises.flatMap((e) => [...e.targetMuscles, ...e.secondaryMuscles]))].sort(),
  equipments: uniq("equipments"),
};

await writeFile(`${ROOT}/data/exercises.json`, JSON.stringify({ exercises }, null, 1));
await writeFile(`${ROOT}/data/taxonomy.json`, JSON.stringify(taxonomy, null, 2));

const count = (key) => exercises.reduce((m, e) => ({ ...m, [e[key]]: (m[e[key]] ?? 0) + 1 }), {});
console.log(`${exercises.length}/${raw.length} bài (bỏ ${noImage} bài không ảnh)`);
console.log("level:", count("level"), "| kind:", count("kind"));
console.log("nhóm cơ:", taxonomy.bodyParts.join(", "));
console.log("dụng cụ:", taxonomy.equipments.join(", "));
