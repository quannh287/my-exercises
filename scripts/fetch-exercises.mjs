// Dumps the whole ExerciseDB catalog to public/data/ so the app never calls the API at runtime.
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://oss.exercisedb.dev/api/v1";
const PAGE = 25; // API silently caps limit at 25
const THROTTLE_MS = 400; // the public API rate-limits well below what a tight loop sends
const MAX_ATTEMPTS = 6;
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../public/data");

async function get(path, attempt = 1) {
  const url = `${API}${path}`;
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (res.status === 429 || res.status >= 500) {
      const after = Number(res.headers.get("retry-after"));
      throw Object.assign(new Error(`HTTP ${res.status}`), { retryAfterMs: after > 0 ? after * 1000 : 0 });
    }
    if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status} ${url}`), { fatal: true });
    const body = await res.json();
    if (!body.success) throw Object.assign(new Error(`API error ${JSON.stringify(body.error)}`), { fatal: true });
    return body;
  } catch (err) {
    // Only transient failures are worth retrying; a 4xx or bad payload will fail the same way again.
    if (err.fatal || attempt >= MAX_ATTEMPTS) throw err;
    const wait = Math.max(err.retryAfterMs ?? 0, 1000 * 2 ** (attempt - 1));
    console.warn(`\n  retry ${attempt}/${MAX_ATTEMPTS} after ${wait}ms — ${url} (${err.message}, ${Date.now() - started}ms)`);
    await new Promise((r) => setTimeout(r, wait));
    return get(path, attempt + 1);
  }
}

async function fetchAllExercises() {
  const all = [];
  const seen = new Set();
  let after = null;
  let total = Infinity;

  while (all.length < total) {
    const q = `?limit=${PAGE}${after ? `&after=${after}` : ""}`;
    const { data, meta } = await get(`/exercises${q}`);
    total = meta.total;
    if (!data.length) break;
    for (const ex of data) {
      if (seen.has(ex.exerciseId)) continue; // guard against a cursor that stops advancing
      seen.add(ex.exerciseId);
      all.push(ex);
    }
    process.stdout.write(`\r  ${all.length}/${total}`);
    if (!meta.hasNextPage || !meta.nextCursor || meta.nextCursor === after) break;
    after = meta.nextCursor;
    await new Promise((r) => setTimeout(r, THROTTLE_MS));
  }
  process.stdout.write("\n");
  return { all, total };
}

const names = (body) => body.data.map((d) => d.name).sort();

console.log("Fetching taxonomy…");
const [bodyParts, muscles, equipments] = await Promise.all([
  get("/bodyparts").then(names),
  get("/muscles").then(names),
  get("/equipments").then(names),
]);
console.log(`  ${bodyParts.length} body parts, ${muscles.length} muscles, ${equipments.length} equipments`);

console.log("Fetching exercises…");
const { all, total } = await fetchAllExercises();

if (all.length < total) throw new Error(`Only got ${all.length}/${total} exercises — refusing to overwrite data`);
const broken = all.filter((e) => !e.exerciseId || !e.name || !e.gifUrl || !e.instructions?.length);
if (broken.length) throw new Error(`${broken.length} exercises missing required fields, e.g. ${broken[0]?.exerciseId}`);

await mkdir(OUT, { recursive: true });
const fetchedAt = new Date().toISOString();
await writeFile(`${OUT}/exercises.json`, JSON.stringify({ fetchedAt, total: all.length, exercises: all }));
await writeFile(`${OUT}/taxonomy.json`, JSON.stringify({ fetchedAt, bodyParts, muscles, equipments }, null, 2));
console.log(`Wrote ${all.length} exercises to public/data/ (${fetchedAt})`);
