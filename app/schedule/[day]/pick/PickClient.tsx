"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { ExerciseBrowser } from "@/components/ExerciseBrowser";
import { setStore, uid } from "@/lib/store";
import type { Exercise, ExerciseKind, Item, WeekDay } from "@/lib/types";

const DEFAULTS = { sets: 3, reps: 12, restSec: 60 };
// Bài khởi động / giãn cơ tính theo thời gian giữ, không phải kg × rep.
const HOLD_DEFAULTS = { sets: 1, reps: 1, restSec: 15, holdSec: 30 };

/** Khối trong lịch ↔ loại bài trong catalog. */
const KIND_FOR_BLOCK: Record<string, ExerciseKind> = { warmup: "warmup", cooldown: "stretch" };

export function PickClient({
  dayKey,
  blockId,
  bodyPart,
  blockKind,
}: {
  dayKey: WeekDay;
  blockId: string;
  bodyPart?: string;
  blockKind?: string;
}) {
  const exerciseKind = blockKind ? KIND_FOR_BLOCK[blockKind] : undefined;
  const router = useRouter();
  const [picked, setPicked] = useState<Exercise[]>([]);
  const selected = new Set(picked.map((e) => e.exerciseId));

  const toggle = (ex: Exercise) =>
    setPicked((p) =>
      p.some((e) => e.exerciseId === ex.exerciseId) ? p.filter((e) => e.exerciseId !== ex.exerciseId) : [...p, ex],
    );

  const confirm = () => {
    const defaults = exerciseKind ? HOLD_DEFAULTS : DEFAULTS;
    const items: Item[] = picked.map((e) => ({ id: uid(), exerciseId: e.exerciseId, ...defaults }));
    setStore((s) => {
      const day = s.schedule.days[dayKey];
      if (!day) return s;
      const blocks = day.blocks.map((b) => (b.id === blockId ? { ...b, items: [...b.items, ...items] } : b));
      return { ...s, schedule: { days: { ...s.schedule.days, [dayKey]: { ...day, blocks } } } };
    });
    router.push(`/schedule/${dayKey}`);
  };

  return (
    <main className="mx-auto min-h-dvh max-w-lg pb-24">
      <AppBar
        title={exerciseKind === "warmup" ? "Chọn bài khởi động" : exerciseKind ? "Chọn bài giãn cơ" : "Chọn bài tập"}
        back={`/schedule/${dayKey}`}
        right={
          picked.length ? (
            <button type="button" onClick={confirm} className="font-semibold">
              Thêm ({picked.length})
            </button>
          ) : null
        }
      />
      <ExerciseBrowser
        bodyPart={exerciseKind ? undefined : bodyPart}
        exerciseKind={exerciseKind}
        selected={selected}
        onToggle={toggle}
      />
    </main>
  );
}
