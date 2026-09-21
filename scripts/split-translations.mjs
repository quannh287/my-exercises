// Sinh danh sách nguồn + chia batch cho vòng dịch trong .translate/.
// Tái dùng bản dịch cũ khi tên/câu khớp (bỏ hoa thường và dấu câu), chỉ batch phần còn thiếu.
// Chạy: node scripts/split-translations.mjs
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = `${ROOT}/.translate`;
const PER_BATCH = { name: 300, sent: 350 };

const { exercises } = JSON.parse(await readFile(`${ROOT}/data/exercises.json`, "utf8"));
const carried = await readFile(`${ROOT}/data/vi.json`, "utf8").then(JSON.parse, () => ({ names: {}, sentences: {} }));

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const index = (dict) => new Map(Object.entries(dict).map(([k, v]) => [norm(k), v]));

const names = [...new Set(exercises.map((e) => e.name))].sort();
const sents = [...new Set(exercises.flatMap((e) => e.instructions.map((i) => i.trim())))].sort();

await mkdir(OUT, { recursive: true });

async function split(kind, list, dict) {
  const known = index(dict);
  const seed = {};
  const todo = [];
  for (const en of list) {
    const vi = known.get(norm(en));
    if (vi) seed[en] = vi;
    else todo.push(en);
  }

  await writeFile(`${OUT}/_${kind}s.json`, JSON.stringify(list));
  await writeFile(`${OUT}/_${kind}-seed.json`, JSON.stringify(seed, null, 1));

  const size = PER_BATCH[kind];
  const batches = Math.ceil(todo.length / size);
  for (let b = 0; b < batches; b++) {
    // Key là chỉ số trong list nguồn — build-translations.mjs tra ngược ra tiếng Anh bằng chính chỉ số đó.
    const body = {};
    for (const en of todo.slice(b * size, (b + 1) * size)) body[list.indexOf(en)] = en;
    await writeFile(`${OUT}/${kind}-${String(b + 1).padStart(2, "0")}.json`, JSON.stringify(body, null, 1));
  }
  console.log(`${kind}: ${list.length} mục, tái dùng ${Object.keys(seed).length}, cần dịch ${todo.length} trong ${batches} batch`);
}

await split("name", names, carried.names);
await split("sent", sents, carried.sentences);
