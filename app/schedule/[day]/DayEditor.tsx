"use client";

import Link from "next/link";
import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ExerciseGif } from "@/components/ExerciseGif";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { Sheet } from "@/components/ui/Sheet";
import { bodyPartLabel } from "@/lib/labels";
import { setStore, uid, useStore } from "@/lib/store";
import { useCatalog } from "@/lib/useCatalog";
import { DAY_LABEL, type Block, type Day, type Item, type WeekDay } from "@/lib/types";

export function DayEditor({ dayKey }: { dayKey: WeekDay }) {
  const day = useStore().schedule.days[dayKey];
  const { catalog } = useCatalog();
  const [editing, setEditing] = useState<{ blockId: string; item: Item } | null>(null);
  const [addingBlock, setAddingBlock] = useState(false);

  const update = (fn: (day: Day) => Day | null) =>
    setStore((s) => ({ ...s, schedule: { days: { ...s.schedule.days, [dayKey]: day ? fn(day) : null } } }));

  const mapBlocks = (fn: (blocks: Block[]) => Block[]) => update((d) => ({ ...d, blocks: fn(d.blocks) }));

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
          <p className="text-muted">Ngày này đang để nghỉ.</p>
          <Button onClick={createDay}>Tạo buổi tập</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg pb-12">
      <AppBar title={DAY_LABEL[dayKey]} back="/" />

      <div className="px-4 pt-5">
        <input
          value={day.name}
          onChange={(e) => update((d) => ({ ...d, name: e.target.value }))}
          placeholder="Tên buổi tập"
          aria-label="Tên buổi tập"
          className="w-full rounded-card border border-line bg-surface px-4 py-3 text-lg font-semibold outline-none focus:border-accent"
        />
      </div>

      {day.blocks.map((block) => (
        <section key={block.id}>
          <div className="flex items-center justify-between px-4 pb-2 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {bodyPartLabel(block.bodyPart)}
            </h2>
            <button
              type="button"
              className="text-sm text-danger"
              onClick={() => mapBlocks((bs) => bs.filter((b) => b.id !== block.id))}
            >
              Xoá nhóm
            </button>
          </div>

          <Card className="mx-4">
            {block.items.map((item) => {
              const ex = catalog?.byId.get(item.exerciseId);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setEditing({ blockId: block.id, item })}
                  className="flex min-h-13 w-full items-center gap-3 px-3 py-2 text-left not-last:border-b not-last:border-line active:bg-line/30"
                >
                  <span className="size-12 shrink-0 overflow-hidden rounded-lg">
                    {ex ? <ExerciseGif src={ex.gifUrl} alt={ex.nameVi} size={96} /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base">{ex?.nameVi ?? item.exerciseId}</span>
                    <span className="ex-name block truncate text-xs text-muted">{ex?.name}</span>
                    <span className="block font-mono text-sm text-muted tabular-nums">
                      {item.sets} × {item.reps} · nghỉ {item.restSec}s
                    </span>
                  </span>
                </button>
              );
            })}
            <Link
              href={`/schedule/${dayKey}/pick?block=${block.id}&bodyPart=${encodeURIComponent(block.bodyPart)}`}
              className="flex min-h-13 items-center px-4 text-base text-accent active:bg-line/30"
            >
              + Thêm bài
            </Link>
          </Card>
        </section>
      ))}

      <div className="mt-8 space-y-3 px-4">
        <Button variant="secondary" onClick={() => setAddingBlock(true)}>
          + Thêm nhóm cơ
        </Button>
        <Button variant="danger" onClick={setRestDay}>
          Đặt thành ngày nghỉ
        </Button>
      </div>

      <Sheet open={addingBlock} onClose={() => setAddingBlock(false)} title="Chọn nhóm cơ">
        <div className="-m-4">
          {(catalog?.taxonomy.bodyParts ?? []).map((bp) => (
            <button
              key={bp}
              type="button"
              className="flex min-h-13 w-full items-center px-4 text-left text-base not-last:border-b not-last:border-line active:bg-line/30"
              onClick={() => {
                mapBlocks((bs) => [...bs, { id: uid(), bodyPart: bp, items: [] }]);
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
          onChange={(next) =>
            mapBlocks((bs) =>
              bs.map((b) =>
                b.id !== editing.blockId
                  ? b
                  : { ...b, items: b.items.map((i) => (i.id === next.id ? next : i)) },
              ),
            )
          }
          onMove={(delta) => {
            mapBlocks((bs) =>
              bs.map((b) => {
                if (b.id !== editing.blockId) return b;
                const from = b.items.findIndex((i) => i.id === editing.item.id);
                const to = from + delta;
                if (from < 0 || to < 0 || to >= b.items.length) return b;
                const items = [...b.items];
                [items[from], items[to]] = [items[to], items[from]];
                return { ...b, items };
              }),
            );
          }}
          onDelete={() => {
            mapBlocks((bs) =>
              bs.map((b) =>
                b.id !== editing.blockId
                  ? b
                  : { ...b, items: b.items.filter((i) => i.id !== editing.item.id) },
              ),
            );
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
  onDelete,
  onClose,
}: {
  item: Item;
  name: string;
  onChange: (item: Item) => void;
  onMove: (delta: -1 | 1) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const patch = (p: Partial<Item>) => onChange({ ...item, ...p });

  return (
    <Sheet open onClose={onClose} title={name}>
      <Card>
        <NumberStepper label="Số set" value={item.sets} onChange={(sets) => patch({ sets })} max={20} />
        <NumberStepper label="Số rep" value={item.reps} onChange={(reps) => patch({ reps })} max={200} />
        <NumberStepper
          label="Nghỉ"
          value={item.restSec}
          onChange={(restSec) => patch({ restSec })}
          min={0}
          max={600}
          step={15}
          suffix="s"
        />
      </Card>

      <SectionTitle>Ghi chú</SectionTitle>
      <textarea
        value={item.note ?? ""}
        onChange={(e) => patch({ note: e.target.value || undefined })}
        rows={3}
        placeholder="vd. chậm 3 nhịp xuống, ghế nghiêng 30°"
        className="w-full rounded-card border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
      />

      <div className="mt-6 space-y-3">
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => onMove(-1)}>
            ↑ Lên
          </Button>
          <Button variant="secondary" onClick={() => onMove(1)}>
            ↓ Xuống
          </Button>
        </div>
        <Button variant="danger" onClick={onDelete}>
          Xoá bài khỏi buổi
        </Button>
      </div>
    </Sheet>
  );
}
