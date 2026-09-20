"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { ExerciseBrowser } from "@/components/ExerciseBrowser";
import { setStore, uid } from "@/lib/store";
import type { Exercise, Item, WeekDay } from "@/lib/types";

const DEFAULTS = { sets: 3, reps: 12, restSec: 60 };

export function PickClient({
  dayKey,
  blockId,
  bodyPart,
}: {
  dayKey: WeekDay;
  blockId: string;
  bodyPart?: string;
}) {
  const router = useRouter();
  const [picked, setPicked] = useState<Exercise[]>([]);
  const selected = new Set(picked.map((e) => e.exerciseId));

  const toggle = (ex: Exercise) =>
    setPicked((p) =>
      p.some((e) => e.exerciseId === ex.exerciseId) ? p.filter((e) => e.exerciseId !== ex.exerciseId) : [...p, ex],
    );

  const confirm = () => {
    const items: Item[] = picked.map((e) => ({ id: uid(), exerciseId: e.exerciseId, ...DEFAULTS }));
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
        title="Chọn bài tập"
        back={`/schedule/${dayKey}`}
        right={
          picked.length ? (
            <button type="button" onClick={confirm} className="font-semibold">
              Thêm ({picked.length})
            </button>
          ) : null
        }
      />
      <ExerciseBrowser bodyPart={bodyPart} selected={selected} onToggle={toggle} />
    </main>
  );
}
