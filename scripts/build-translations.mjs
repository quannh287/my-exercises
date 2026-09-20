// Merges the per-batch translation files in .translate/ into public/data/vi.json.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const json = async (p) => JSON.parse(await readFile(p, "utf8"));

async function collect(kind, sourceList) {
  const files = (await readdir(`${ROOT}/.translate`))
    .filter((f) => f.startsWith(`${kind}-`) && f.endsWith(".out.json"))
    .sort();
  const out = {};
  let translated = 0;
  for (const f of files) {
    const batch = await json(`${ROOT}/.translate/${f}`);
    for (const [index, vi] of Object.entries(batch)) {
      const en = sourceList[Number(index)];
      if (en === undefined) throw new Error(`${f}: index ${index} is out of range`);
      if (!vi?.trim()) continue;
      out[en] = vi.trim();
      translated++;
    }
  }
  const missing = sourceList.filter((en) => !out[en]);
  console.log(`${kind}: ${translated}/${sourceList.length} translated, ${missing.length} missing (${files.length} batches)`);
  if (missing.length) console.log(`  e.g. ${missing.slice(0, 3).map((m) => JSON.stringify(m.slice(0, 50))).join(", ")}`);
  return out;
}

const [names, sentences] = await Promise.all([
  json(`${ROOT}/.translate/_names.json`).then((l) => collect("name", l)),
  json(`${ROOT}/.translate/_sents.json`).then((l) => collect("sent", l)),
]);

await writeFile(`${ROOT}/public/data/vi.json`, JSON.stringify({ names, sentences }));
console.log(`Wrote public/data/vi.json — ${Object.keys(names).length} names, ${Object.keys(sentences).length} sentences`);
