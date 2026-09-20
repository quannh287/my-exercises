"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExerciseGif } from "@/components/ExerciseGif";
import { Sheet } from "@/components/ui/Sheet";
import { search } from "@/lib/exercises";
import { bodyPartLabel, equipmentLabel } from "@/lib/labels";
import { useCatalog } from "@/lib/useCatalog";
import type { Exercise } from "@/lib/types";

type Props = {
  /** Locks the list to one body part (the block being edited). */
  bodyPart?: string;
  selected?: Set<string>;
  onToggle?: (exercise: Exercise) => void;
};

export function ExerciseBrowser({ bodyPart, selected, onToggle }: Props) {
  const { catalog, error, loading } = useCatalog();
  const [q, setQ] = useState("");
  const [bodyParts, setBodyParts] = useState<string[]>(bodyPart ? [bodyPart] : []);
  const [equipments, setEquipments] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(
    () => (catalog ? search(catalog, { q, bodyParts, equipments }) : []),
    [catalog, q, bodyParts, equipments],
  );

  const activeFilters = bodyParts.length + equipments.length;

  return (
    <>
      <div className="sticky top-13 z-20 flex gap-2 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm bài (Việt hoặc Anh)"
          aria-label="Tìm bài tập"
          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="h-11 shrink-0 rounded-full border border-line bg-surface px-4 text-sm text-accent"
        >
          Lọc{activeFilters ? ` (${activeFilters})` : ""}
        </button>
      </div>

      {error ? (
        <p className="px-4 py-10 text-center text-muted">
          {error}. Chạy <code className="font-mono">pnpm data:fetch</code> rồi tải lại trang.
        </p>
      ) : null}
      {loading ? <p className="px-4 py-10 text-center text-muted">Đang tải danh sách bài tập…</p> : null}
      {catalog && !results.length ? (
        <p className="px-4 py-10 text-center text-muted">Không có bài nào khớp.</p>
      ) : null}
      {results.length ? (
        <p className="px-4 py-2 text-sm text-muted">{results.length} bài</p>
      ) : null}

      <ul className="divide-y divide-line">
        {results.map((ex) => {
          const isSelected = selected?.has(ex.exerciseId);
          const body = (
            <>
              <span className="size-14 shrink-0 overflow-hidden rounded-lg">
                <ExerciseGif src={ex.gifUrl} alt={ex.nameVi} size={112} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base">{ex.nameVi}</span>
                <span className="ex-name block truncate text-xs text-muted">{ex.name}</span>
                <span className="block truncate text-sm text-muted">
                  {ex.bodyParts.map(bodyPartLabel).join(", ")} · {ex.equipments.map(equipmentLabel).join(", ")}
                </span>
              </span>
              {onToggle ? (
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs text-white ${
                    isSelected ? "border-accent bg-accent" : "border-line"
                  }`}
                  aria-hidden
                >
                  {isSelected ? "✓" : ""}
                </span>
              ) : null}
            </>
          );

          const cls = "flex w-full items-center gap-3 bg-surface px-4 py-2.5 text-left active:bg-line/30";
          return (
            <li key={ex.exerciseId} className="vrow">
              {onToggle ? (
                <button type="button" onClick={() => onToggle(ex)} aria-pressed={isSelected} className={cls}>
                  {body}
                </button>
              ) : (
                <Link href={`/exercises/${ex.exerciseId}`} className={cls}>
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Bộ lọc">
        <FilterGroup
          title="Nhóm cơ"
          options={catalog?.taxonomy.bodyParts ?? []}
          selected={bodyParts}
          onChange={setBodyParts}
          label={bodyPartLabel}
        />
        <FilterGroup
          title="Dụng cụ"
          options={catalog?.taxonomy.equipments ?? []}
          selected={equipments}
          onChange={setEquipments}
          label={equipmentLabel}
        />
      </Sheet>
    </>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onChange,
  label,
}: {
  title: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  label: (v: string) => string;
}) {
  return (
    <section className="mb-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(on ? selected.filter((v) => v !== o) : [...selected, o])}
              className={`min-h-11 rounded-full border px-3.5 text-sm ${
                on ? "border-accent bg-accent text-white" : "border-line bg-surface text-ink"
              }`}
            >
              {label(o)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
