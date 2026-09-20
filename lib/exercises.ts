import { cleanInstruction } from "./labels";
import type { Exercise } from "./types";

/** English source string → Vietnamese, deduplicated across the catalog. */
export type Dictionary = { names: Record<string, string>; sentences: Record<string, string> };

export type Taxonomy = { bodyParts: string[]; muscles: string[]; equipments: string[] };
export type Catalog = { exercises: Exercise[]; byId: Map<string, Exercise>; taxonomy: Taxonomy };

let pending: Promise<Catalog> | null = null;

async function loadJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Không tải được ${url} (HTTP ${res.status})`);
  return res.json();
}

/** Loads the bundled catalog once per page session; concurrent callers share one fetch. */
export function loadCatalog(): Promise<Catalog> {
  pending ??= (async () => {
    try {
      const [ex, taxonomy, vi] = await Promise.all([
        loadJson<{ exercises: Exercise[] }>("/data/exercises.json"),
        loadJson<Taxonomy>("/data/taxonomy.json"),
        // Translations are optional: the app stays usable in English if the file is missing.
        loadJson<Dictionary>("/data/vi.json").catch<Dictionary>(() => ({ names: {}, sentences: {} })),
      ]);
      const exercises = ex.exercises.map((e) => ({
        ...e,
        nameVi: vi.names[e.name] ?? e.name,
        instructionsVi: e.instructions.map((raw) => {
          const en = cleanInstruction(raw);
          return vi.sentences[en] ?? en;
        }),
      }));
      return {
        exercises,
        byId: new Map(exercises.map((e) => [e.exerciseId, e])),
        taxonomy,
      };
    } catch (err) {
      pending = null; // let the next caller retry instead of caching the failure forever
      throw err;
    }
  })();
  return pending;
}

export type Filters = {
  q?: string;
  bodyParts?: string[];
  equipments?: string[];
  targetMuscles?: string[];
};

const hasAny = (values: string[], wanted?: string[]) =>
  !wanted?.length || values.some((v) => wanted.includes(v));

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

/** Matches the English name or the Vietnamese one, with or without diacritics. */
export function search(catalog: Catalog, f: Filters): Exercise[] {
  const q = f.q?.trim() ? fold(f.q) : "";
  const out: Exercise[] = [];
  for (const e of catalog.exercises) {
    if (q && !e.name.includes(q) && !fold(e.nameVi).includes(q)) continue;
    if (!hasAny(e.bodyParts, f.bodyParts)) continue;
    if (!hasAny(e.equipments, f.equipments)) continue;
    if (!hasAny(e.targetMuscles, f.targetMuscles)) continue;
    out.push(e);
  }
  return out;
}
