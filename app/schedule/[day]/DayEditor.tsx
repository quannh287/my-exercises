"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { Chip, Label } from "@/components/ui/Chip";
import { ExerciseImage } from "@/components/ExerciseImage";
import { Sheet } from "@/components/ui/Sheet";
import { Stepper } from "@/components/ui/Stepper";
import { insertBlock, sections } from "@/lib/blocks";
import { blockKindLabel, bodyPartLabel } from "@/lib/labels";
import { setStore, uid, useStore } from "@/lib/store";
import { useCatalog } from "@/lib/useCatalog";
import { estimateMinutes } from "@/lib/stats";
import {
  countItems,
  DAY_LABEL,
  type Block,
  type BlockKind,
  type Day,
  type Item,
  type WeekDay,
} from "@/lib/types";
import { Icon, type IconName } from "@/components/ui/Icon";

export function DayEditor({ dayKey }: { dayKey: WeekDay }) {
  const router = useRouter();
  const day = useStore().schedule.days[dayKey];
  const { catalog } = useCatalog();
  const [editing, setEditing] = useState<{ blockId: string; item: Item } | null>(null);
  const [addingBlock, setAddingBlock] = useState(false);

  const update = (fn: (day: Day) => Day | null) =>
    setStore((s) => ({ ...s, schedule: { days: { ...s.schedule.days, [dayKey]: day ? fn(day) : null } } }));

  const mapBlocks = (fn: (blocks: Block[]) => Block[]) => update((d) => ({ ...d, blocks: fn(d.blocks) }));

  const mapItems = (blockId: string, fn: (items: Item[]) => Item[]) =>
    mapBlocks((bs) => bs.map((b) => (b.id === blockId ? { ...b, items: fn(b.items) } : b)));

  /** Khối khởi động/giãn cơ chỉ sinh ra khi người dùng thật sự thêm bài vào đó. */
  const addToBlock = (kind: BlockKind) => {
    const existing = day?.blocks.find((b) => b.kind === kind);
    const id = existing?.id ?? uid();
    if (!existing) mapBlocks((bs) => insertBlock(bs, { id, kind, items: [] }));
    router.push(`/schedule/${dayKey}/pick?block=${id}&kind=${kind}`);
  };

  const setRestDay = () =>
    setStore((s) => ({ ...s, schedule: { days: { ...s.schedule.days, [dayKey]: null } } }));

  const createDay = () =>
    setStore((s) => ({
      ...s,
      schedule: { days: { ...s.schedule.days, [dayKey]: { name: "Buổi tập", blocks: [] } } },
    }));

  if (!day) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col">
        <AppBar title={DAY_LABEL[dayKey]} back="/" />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-tertiary-soft text-tertiary">
            <Icon name="moon" className="size-7" strokeWidth={1.6} />
          </span>
          <p className="text-muted">Ngày này đang để nghỉ.</p>
          <Button onClick={createDay}>Tạo buổi tập</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg pb-12">
      <AppBar title={DAY_LABEL[dayKey]} back="/" />

      <div className="flex items-end justify-between gap-3 px-4 pt-5">
        <span className="min-w-0">
          <Label>Lịch tập tuần</Label>
          <h1 className="truncate font-serif text-2xl font-bold">Sửa lịch {DAY_LABEL[dayKey]}</h1>
        </span>
        <Chip tone="accent">
          <Icon name="check" className="size-3.5" strokeWidth={2.4} />
          Tự động lưu
        </Chip>
      </div>

      <div className="mt-4 rounded-card bg-surface p-4 shadow-soft mx-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted">Tên buổi tập</span>
          <span className="text-xs text-tertiary">Chạm để chỉnh sửa</span>
        </div>
        <input
          value={day.name}
          onChange={(e) => update((d) => ({ ...d, name: e.target.value }))}
          placeholder="Tên buổi tập"
          aria-label="Tên buổi tập"
          className="mt-2 w-full rounded-card bg-bg px-4 py-3 font-serif text-lg font-semibold outline-none focus:ring-2 focus:ring-accent/40"
        />
        <p className="mt-2 text-sm text-muted">
          {countItems(day)} bài tập · Dự kiến {estimateMinutes(day)} phút
        </p>
      </div>

      <div className="mt-4 flex gap-3 px-4">
        <button
          type="button"
          onClick={() => setAddingBlock(true)}
          className="flex-1 rounded-card bg-accent-soft px-4 py-3 text-sm font-semibold text-accent active:bg-accent/20"
        >
          + Thêm nhóm cơ
        </button>
        <button
          type="button"
          onClick={setRestDay}
          className="flex-1 rounded-card bg-danger/10 px-4 py-3 text-sm font-semibold text-danger active:bg-danger/20"
        >
          Đặt thành ngày nghỉ
        </button>
      </div>

      {sections(day).map(({ kind, block }) => (
        <section key={block?.id ?? kind} className="px-4">
          <div className="flex items-center gap-2 pb-2 pt-7">
            <span
              className={`size-2.5 shrink-0 rounded-full ${kind === "main" ? "bg-accent" : "bg-tertiary"}`}
              aria-hidden
            />
            <h2 className="truncate font-serif text-lg font-bold">
              {kind === "main" ? bodyPartLabel(block?.bodyPart ?? "") : blockKindLabel(kind)}
            </h2>
            <Chip>{block?.items.length ?? 0} bài</Chip>
            <span className="flex-1" />
            {block && kind === "main" ? (
              <Link
                href={`/schedule/${dayKey}/pick?block=${block.id}&bodyPart=${encodeURIComponent(block.bodyPart ?? "")}`}
                className="shrink-0 text-sm font-semibold text-accent"
              >
                + Thêm bài
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => addToBlock(kind)}
                className="shrink-0 text-sm font-semibold text-accent"
              >
                + Thêm bài
              </button>
            )}
          </div>

          <div className="space-y-2">
            {(block?.items ?? []).map((item) => {
              const ex = catalog?.byId.get(item.exerciseId);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setEditing({ blockId: block!.id, item })}
                  className="flex w-full items-center gap-3 rounded-card bg-surface p-3 text-left shadow-soft active:bg-accent-soft/40"
                >
                  <span className="size-14 shrink-0 overflow-hidden rounded-card">
                    {ex ? <ExerciseImage srcs={ex.imageUrls} alt={ex.nameVi} size={112} /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-base font-semibold">
                      {ex?.nameVi ?? item.exerciseId}
                    </span>
                    <span className="ex-name block truncate text-xs text-muted">{ex?.name}</span>
                    <span className="mt-0.5 block font-mono text-sm text-muted tabular-nums">
                      {item.holdSec ? `${item.sets} × giữ ${item.holdSec}s` : `${item.sets} × ${item.reps}`}
                      {item.weight ? ` · ${item.weight}kg` : ""} · nghỉ {item.restSec}s
                    </span>
                  </span>
                  <Icon name="more" className="size-5 text-muted" strokeWidth={2} />
                </button>
              );
            })}

            {!block?.items.length ? (
              <p className="rounded-card bg-surface px-4 py-6 text-center text-sm text-muted shadow-soft">
                {kind === "main" ? "Nhóm này chưa có bài nào." : `Chưa có bài ${blockKindLabel(kind).toLowerCase()}.`}
              </p>
            ) : null}
          </div>

          {block && kind === "main" ? (
            <button
              type="button"
              className="mt-2 text-sm text-danger"
              onClick={() => mapBlocks((bs) => bs.filter((b) => b.id !== block.id))}
            >
              Xoá nhóm {bodyPartLabel(block.bodyPart ?? "")}
            </button>
          ) : null}
        </section>
      ))}

      <Sheet open={addingBlock} onClose={() => setAddingBlock(false)} title="Chọn nhóm cơ">
        <div className="-m-4">
          {(catalog?.taxonomy.bodyParts ?? []).map((bp) => (
            <button
              key={bp}
              type="button"
              className="flex min-h-13 w-full items-center px-4 text-left text-base not-last:border-b not-last:border-line/50 active:bg-accent-soft/40"
              onClick={() => {
                mapBlocks((bs) => insertBlock(bs, { id: uid(), kind: "main", bodyPart: bp, items: [] }));
                setAddingBlock(false);
              }}
            >
              {bodyPartLabel(bp)}
            </button>
          ))}
        </div>
      </Sheet>

      {editing ? (
        <ItemSheet
          item={editing.item}
          name={catalog?.byId.get(editing.item.exerciseId)?.nameVi ?? editing.item.exerciseId}
          onClose={() => setEditing(null)}
          onChange={(next) => {
            mapItems(editing.blockId, (items) => items.map((i) => (i.id === next.id ? next : i)));
            setEditing({ ...editing, item: next });
          }}
          onMove={(delta) =>
            mapItems(editing.blockId, (items) => {
              const from = items.findIndex((i) => i.id === editing.item.id);
              const to = from + delta;
              if (from < 0 || to < 0 || to >= items.length) return items;
              const next = [...items];
              [next[from], next[to]] = [next[to], next[from]];
              return next;
            })
          }
          onDuplicate={() => {
            mapItems(editing.blockId, (items) => {
              const at = items.findIndex((i) => i.id === editing.item.id);
              const copy = { ...editing.item, id: uid() };
              return [...items.slice(0, at + 1), copy, ...items.slice(at + 1)];
            });
            setEditing(null);
          }}
          onDelete={() => {
            mapItems(editing.blockId, (items) => items.filter((i) => i.id !== editing.item.id));
            setEditing(null);
          }}
        />
      ) : null}
    </main>
  );
}

function ItemSheet({
  item,
  name,
  onChange,
  onMove,
  onDuplicate,
  onDelete,
  onClose,
}: {
  item: Item;
  name: string;
  onChange: (item: Item) => void;
  onMove: (delta: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const patch = (p: Partial<Item>) => onChange({ ...item, ...p });

  return (
    <Sheet open onClose={onClose} title={name}>
      <Label>Chỉnh sửa bài tập</Label>
      <h3 className="mt-1 font-serif text-xl font-bold">{name}</h3>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <Tile onClick={() => onMove(-1)} icon="arrowUp" label="Lên" />
        <Tile onClick={() => onMove(1)} icon="arrowDown" label="Xuống" />
        <Tile onClick={onDuplicate} icon="copy" label="Nhân bản" />
        <Tile onClick={onDelete} icon="trash" label="Xoá bài" danger />
      </div>

      <div className="mt-3 space-y-2">
        <Stepper label="Số sets" value={item.sets} onChange={(sets) => patch({ sets })} steps={[1]} min={1} max={20} />
        <Stepper label="Reps" value={item.reps} onChange={(reps) => patch({ reps })} steps={[1, 5]} min={1} max={200} />
        <Stepper
          label="Tạ"
          unit="kg"
          value={item.weight ?? 0}
          onChange={(weight) => patch({ weight: weight || undefined })}
          steps={[2.5, 5]}
          max={500}
        />
        <Stepper
          label="Nghỉ"
          unit="giây"
          value={item.restSec}
          onChange={(restSec) => patch({ restSec })}
          steps={[15, 30]}
          max={600}
        />
      </div>

      <div className="mt-3 rounded-card bg-bg p-3">
        <Label>Ghi chú kỹ thuật</Label>
        <textarea
          value={item.note ?? ""}
          onChange={(e) => patch({ note: e.target.value || undefined })}
          rows={3}
          placeholder="vd. chậm 3 nhịp xuống, ghế nghiêng 30°"
          className="mt-2 w-full rounded-card bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="mt-4">
        <Button onClick={onClose}>Xong</Button>
      </div>
    </Sheet>
  );
}

function Tile({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-card px-1 text-xs font-semibold ${
        danger ? "bg-danger/10 text-danger" : "bg-bg text-ink"
      }`}
    >
      <Icon name={icon} className="size-5" />
      {label}
    </button>
  );
}

