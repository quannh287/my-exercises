// Gộp bản dịch tái dùng (_*-seed.json) với các batch đã dịch trong .translate/ thành data/vi.json.
// Chạy: pnpm data:vi
import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const json = async (p, fallback) =>
  readFile(p, "utf8").then(JSON.parse, (err) => {
    if (fallback !== undefined) return fallback;
    throw err;
  });

async function collect(kind, sourceList) {
  const out = await json(`${ROOT}/.translate/_${kind}-seed.json`, {});
  const seeded = Object.keys(out).length;

  const files = (await readdir(`${ROOT}/.translate`))
    .filter((f) => f.startsWith(`${kind}-`) && f.endsWith(".out.json"))
    .sort();
  for (const f of files) {
    const batch = await json(`${ROOT}/.translate/${f}`);
    for (const [index, vi] of Object.entries(batch)) {
      const en = sourceList[Number(index)];
      if (en === undefined) throw new Error(`${f}: index ${index} nằm ngoài danh sách nguồn`);
      if (!vi?.trim()) continue;
      out[en] = vi.trim();
    }
  }

  const missing = sourceList.filter((en) => !out[en]);
  console.log(
    `${kind}: ${sourceList.length - missing.length}/${sourceList.length} đã dịch ` +
      `(${seeded} tái dùng, ${files.length} batch), thiếu ${missing.length}`,
  );
  if (missing.length) console.log(`  vd. ${missing.slice(0, 3).map((m) => JSON.stringify(m.slice(0, 50))).join(", ")}`);
  return out;
}

const [names, sentences] = await Promise.all([
  json(`${ROOT}/.translate/_names.json`).then((l) => collect("name", l)),
  json(`${ROOT}/.translate/_sents.json`).then((l) => collect("sent", l)),
]);

// Ghi vào data/ chứ không phải public/data/ — build-catalog.mjs đọc từ đây rồi mới dựng bundle.
await writeFile(`${ROOT}/data/vi.json`, JSON.stringify({ names, sentences }));
console.log(`data/vi.json — ${Object.keys(names).length} tên, ${Object.keys(sentences).length} câu`);
