"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExerciseGif } from "@/components/ExerciseGif";
import { Chip, Label } from "@/components/ui/Chip";
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

  const results = useMemo(
    () => (catalog ? search(catalog, { q, bodyParts, equipments }) : []),
    [catalog, q, bodyParts, equipments],
  );

  const heading =
    bodyParts.length === 1 ? `Danh mục ${bodyPartLabel(bodyParts[0])}` : "Tất cả bài tập";

  return (
    <>
      <div className="sticky top-13 z-20 border-b border-line/50 bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2 rounded-card bg-surface px-3 shadow-soft">
          <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên bài tập (Việt hoặc Anh)"
            aria-label="Tìm bài tập"
            className="h-12 min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
          />
          {q ? (
            <button type="button" onClick={() => setQ("")} aria-label="Xoá tìm kiếm" className="px-1 text-muted">
              ✕
            </button>
          ) : null}
        </div>
      </div>

      {bodyPart ? null : (
        <FilterRow
          title="Nhóm cơ chính"
          count={`${catalog?.taxonomy.bodyParts.length ?? 0} nhóm`}
          options={catalog?.taxonomy.bodyParts ?? []}
          selected={bodyParts}
          onChange={setBodyParts}
          label={bodyPartLabel}
        />
      )}
      <FilterRow
        title="Dụng cụ tập"
        options={catalog?.taxonomy.equipments ?? []}
        selected={equipments}
        onChange={setEquipments}
        label={equipmentLabel}
      />

      <div className="flex items-center gap-2 px-4 pb-2 pt-6">
        <h2 className="truncate font-serif text-lg font-bold">{heading}</h2>
        {results.length ? <Chip tone="accent">{results.length} bài</Chip> : null}
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

      <ul className="space-y-3 px-4">
        {results.map((ex) => {
          const isSelected = selected?.has(ex.exerciseId);
          const body = (
            <>
              <span className="size-20 shrink-0 overflow-hidden rounded-card">
                <ExerciseGif src={ex.gifUrl} alt={ex.nameVi} size={160} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs text-tertiary">
                  {ex.equipments.map(equipmentLabel).join(" · ")}
                </span>
                <span className="mt-0.5 block truncate font-serif text-base font-semibold">{ex.nameVi}</span>
                <span className="ex-name block truncate text-sm text-muted">{ex.name}</span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  Nhóm cơ: {ex.bodyParts.map(bodyPartLabel).join(", ")}
                </span>
              </span>
              {onToggle ? (
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full border text-sm text-white ${
                    isSelected ? "border-accent bg-accent" : "border-line"
                  }`}
                  aria-hidden
                >
                  {isSelected ? "✓" : ""}
                </span>
              ) : (
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-bg text-muted" aria-hidden>
                  <svg viewBox="0 0 8 14" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 1l6 6-6 6" strokeLinecap="round" />
                  </svg>
                </span>
              )}
            </>
          );

          const cls =
            "flex w-full items-center gap-3 rounded-card bg-surface p-3 text-left shadow-soft active:bg-accent-soft/40";
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
    </>
  );
}

function FilterRow({
  title,
  count,
  options,
  selected,
  onChange,
  label,
}: {
  title: string;
  count?: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  label: (v: string) => string;
}) {
  const chip = (on: boolean) =>
    `flex min-h-10 shrink-0 items-center gap-1 rounded-full px-4 text-sm ${
      on ? "bg-accent font-semibold text-white" : "bg-surface text-ink"
    }`;

  return (
    <section className="pt-4">
      <div className="flex items-center justify-between px-4 pb-2">
        <Label>{title}</Label>
        {count ? <span className="text-xs text-accent">{count}</span> : null}
      </div>
      {/* Horizontal scroll keeps 28 equipment chips off a six-row wall of text. */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button type="button" onClick={() => onChange([])} className={chip(!selected.length)}>
          Tất cả
        </button>
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(on ? selected.filter((v) => v !== o) : [...selected, o])}
              className={chip(on)}
            >
              {on ? "✓ " : ""}
              {label(o)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
