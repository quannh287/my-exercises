// Dò gifUrl nào đã chết trên CDN → data/broken-gifs.json, để build-catalog.mjs loại bài đó khỏi catalog.
// Chạy tay sau mỗi lần `pnpm data:fetch` — KHÔNG gắn vào prebuild: build Vercel mà CDN chập là mất bài oan.
// Chạy: node scripts/check-gifs.mjs
import { readFile, writeFile } from "node:fs/promises";

const CONCURRENCY = 12;
const TIMEOUT_MS = 20_000;
const ATTEMPTS = 3;

const here = (p) => new URL(p, import.meta.url);
const { exercises } = JSON.parse(await readFile(here("../data/exercises.json"), "utf8"));

/** true = CDN chắc chắn không có file. Lỗi mạng trả về null → coi như còn sống, không dám loại oan. */
async function missing(url, attempt = 1) {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (res.status === 404) return true;
    if (res.ok) return false;
    throw new Error(`HTTP ${res.status}`); // 429/5xx là tạm thời, thử lại
  } catch (err) {
    if (attempt >= ATTEMPTS) {
      console.warn(`  bỏ qua ${url} — ${err.message}`);
      return null;
    }
    await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
    return missing(url, attempt + 1);
  }
}

const queue = [...exercises];
const broken = [];
let done = 0;
let unknown = 0;

await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let e = queue.shift(); e; e = queue.shift()) {
      const dead = await missing(e.gifUrl);
      if (dead) broken.push(e.exerciseId);
      else if (dead === null) unknown++;
      process.stdout.write(`\r  ${++done}/${exercises.length} — ${broken.length} hỏng`);
    }
  }),
);
process.stdout.write("\n");

broken.sort();
await writeFile(
  here("../data/broken-gifs.json"),
  JSON.stringify({ checkedAt: new Date().toISOString(), total: exercises.length, ids: broken }, null, 2) + "\n",
);
console.log(`data/broken-gifs.json — ${broken.length}/${exercises.length} gif 404${unknown ? `, ${unknown} bài không kiểm tra được` : ""}`);
