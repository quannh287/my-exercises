// Splits data/ into what the app actually needs up front (catalog.json) and what it only
// needs when a single exercise is opened (details.json).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = `${ROOT}/public/data`;
const json = async (p) => JSON.parse(await readFile(p, "utf8"));

const [{ exercises }, taxonomy, vi] = await Promise.all([
  json(`${ROOT}/data/exercises.json`),
  json(`${ROOT}/data/taxonomy.json`),
  json(`${ROOT}/data/vi.json`).catch(() => ({ names: {}, sentences: {} })),
]);

const catalog = { taxonomy, exercises: [] };
const details = {};
for (const e of exercises) {
  catalog.exercises.push({
    exerciseId: e.exerciseId,
    name: e.name,
    nameVi: vi.names[e.name] ?? e.name,
    imageUrls: e.imageUrls,
    bodyParts: e.bodyParts,
    equipments: e.equipments,
    targetMuscles: e.targetMuscles,
    level: e.level,
    kind: e.kind,
  });
  details[e.exerciseId] = {
    secondaryMuscles: e.secondaryMuscles,
    // Thiếu bản dịch thì rơi về tiếng Anh: hướng dẫn tiếng Anh vẫn hơn màn hình trống.
    instructionsVi: e.instructions.map((raw) => vi.sentences[raw] ?? raw),
    mechanic: e.mechanic,
    force: e.force,
  };
}

const count = (key) => catalog.exercises.reduce((m, e) => ({ ...m, [e[key]]: (m[e[key]] ?? 0) + 1 }), {});
const translated = catalog.exercises.filter((e) => e.nameVi !== e.name).length;
console.log(`${catalog.exercises.length} bài · ${translated} tên đã dịch`);
console.log("level:", count("level"), "| kind:", count("kind"));

await mkdir(OUT, { recursive: true });
for (const [name, value] of [["catalog", catalog], ["details", details]]) {
  const body = JSON.stringify(value);
  await writeFile(`${OUT}/${name}.json`, body);
  console.log(`public/data/${name}.json — ${(body.length / 1024).toFixed(0)} KB`);
}
