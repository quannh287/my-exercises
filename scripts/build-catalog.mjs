// Splits data/ into what the app actually needs up front (catalog.json) and what it only
// needs when a single exercise is opened (details.json) — 2 MB of JSON down to ~400 KB.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = `${ROOT}/public/data`;
const json = async (p) => JSON.parse(await readFile(p, "utf8"));

// Mirror of cleanInstruction() in lib/labels.ts — the dictionary is keyed by the cleaned string.
const clean = (s) => s.replace(/^Step:\d+\s*/, "");

const [{ exercises }, taxonomy, vi] = await Promise.all([
  json(`${ROOT}/data/exercises.json`),
  json(`${ROOT}/data/taxonomy.json`),
  json(`${ROOT}/data/vi.json`).catch(() => ({ names: {}, sentences: {} })),
]);

const catalog = { taxonomy, exercises: [], };
const details = {};
for (const e of exercises) {
  catalog.exercises.push({
    exerciseId: e.exerciseId,
    name: e.name,
    nameVi: vi.names[e.name] ?? e.name,
    gifUrl: e.gifUrl,
    bodyParts: e.bodyParts,
    equipments: e.equipments,
    targetMuscles: e.targetMuscles,
  });
  details[e.exerciseId] = {
    secondaryMuscles: e.secondaryMuscles,
    instructionsVi: e.instructions.map((raw) => vi.sentences[clean(raw)] ?? clean(raw)),
  };
}

await mkdir(OUT, { recursive: true });
for (const [name, value] of [["catalog", catalog], ["details", details]]) {
  const body = JSON.stringify(value);
  await writeFile(`${OUT}/${name}.json`, body);
  console.log(`public/data/${name}.json — ${(body.length / 1024).toFixed(0)} KB`);
}
