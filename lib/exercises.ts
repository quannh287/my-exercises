import type { Details, Exercise, ExerciseKind, Level } from "./types";

export type Taxonomy = { bodyParts: string[]; muscles: string[]; equipments: string[] };
export type Catalog = { exercises: Exercise[]; byId: Map<string, Exercise>; taxonomy: Taxonomy };

async function loadJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Không tải được ${url} (HTTP ${res.status})`);
  return res.json();
}

/** Caches one in-flight promise per file so concurrent callers share a single fetch. */
function once<T>(load: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | null = null;
  return () => (pending ??= load().catch((err) => {
    pending = null; // let the next caller retry instead of caching the failure forever
    throw err;
  }));
}

/** The list view's slice of the catalog: names, images and filters, pre-merged at build time. */
export const loadCatalog = once<Catalog>(async () => {
  const { taxonomy, exercises } = await loadJson<{ taxonomy: Taxonomy; exercises: Exercise[] }>(
    "/data/catalog.json",
  );
  return { exercises, byId: new Map(exercises.map((e) => [e.exerciseId, e])), taxonomy };
});

/** Instructions are ~650 KB, so they load only when an exercise is actually opened. */
export const loadDetails = once<Record<string, Details>>(() =>
  loadJson<Record<string, Details>>("/data/details.json"),
);

export type Filters = {
  q?: string;
  bodyParts?: string[];
  equipments?: string[];
  targetMuscles?: string[];
  levels?: Level[];
  /** Không truyền = chỉ bài chính; màn khởi động/giãn cơ truyền loại tương ứng. */
  kind?: ExerciseKind;
};

const hasAny = (values: string[], wanted?: string[]) =>
  !wanted?.length || values.some((v) => wanted.includes(v));

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

/** Matches the English name or the Vietnamese one, with or without diacritics. */
export function search(catalog: Catalog, f: Filters): Exercise[] {
  const q = f.q?.trim() ? fold(f.q) : "";
  const out: Exercise[] = [];
  for (const e of catalog.exercises) {
    if (e.kind !== (f.kind ?? "main")) continue;
    if (q && !fold(e.name).includes(q) && !fold(e.nameVi).includes(q)) continue;
    if (!hasAny(e.bodyParts, f.bodyParts)) continue;
    if (!hasAny(e.equipments, f.equipments)) continue;
    if (!hasAny(e.targetMuscles, f.targetMuscles)) continue;
    // Đang gõ tìm thì đừng giấu bài: gõ đúng tên mà không thấy sẽ tưởng app thiếu dữ liệu.
    if (!q && f.levels?.length && !f.levels.includes(e.level)) continue;
    out.push(e);
  }
  return out.sort((a, b) => a.level - b.level);
}
