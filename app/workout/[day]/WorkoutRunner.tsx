"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ExerciseGif } from "@/components/ExerciseGif";
import { RestTimer } from "@/components/RestTimer";
import { Sheet } from "@/components/ui/Sheet";
import { setStore, uid, useStore } from "@/lib/store";
import { useCatalog } from "@/lib/useCatalog";
import { completeSet as advance, startProgress, type Progress } from "@/lib/workout";
import { flatItems, type Log, type LogEntry, type WeekDay } from "@/lib/types";

export function WorkoutRunner({ dayKey }: { dayKey: WeekDay }) {
  const router = useRouter();
  const day = useStore().schedule.days[dayKey];
  const { catalog } = useCatalog();

  const items = useMemo(() => (day ? flatItems(day) : []), [day]);
  const [startedAt] = useState(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [progress, setProgress] = useState<Progress>(startProgress);
  const [restSec, setRestSec] = useState<number | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const { index, setsDone } = progress;
  const item = items[index];
  const exercise = item ? catalog?.byId.get(item.exerciseId) : undefined;
  const finished = elapsedMs !== null;

  const saveLog = useCallback(
    (done: LogEntry[]) => {
      if (!day || !done.length) return;
      const finishedAt = Date.now();
      const log: Log = {
        id: uid(),
        dateISO: new Date().toISOString(),
        dayKey,
        dayName: day.name,
        startedAt,
        finishedAt,
        entries: done,
      };
      setStore((s) => ({ ...s, logs: [log, ...s.logs] }));
      setElapsedMs(finishedAt - startedAt);
    },
    [day, dayKey, startedAt],
  );

  const completeSet = () => {
    const { next, rest, finished: done } = advance(items, progress);
    setProgress(next);
    if (done) saveLog(next.entries);
    else if (rest > 0) setRestSec(rest);
  };

  if (!day || !items.length) {
    return (
      <Centered>
        <p className="text-muted">Buổi này chưa có bài nào.</p>
        <Button onClick={() => router.replace(`/schedule/${dayKey}`)}>Thiết lập buổi tập</Button>
      </Centered>
    );
  }

  if (finished) {
    const minutes = Math.max(1, Math.round(elapsedMs / 60000));
    return (
      <Centered>
        <p className="text-5xl">✓</p>
        <h1 className="text-2xl font-bold">Xong buổi {day.name}</h1>
        <p className="text-muted">
          {items.length} bài · {minutes} phút
        </p>
        <Button onClick={() => router.replace("/history")}>Xem lịch sử</Button>
        <Button variant="secondary" onClick={() => router.replace("/")}>
          Về lịch tập
        </Button>
      </Centered>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col bg-surface">
      <header className="flex min-h-13 items-center justify-between px-4">
        <span className="font-mono text-sm text-muted tabular-nums">
          Bài {index + 1}/{items.length}
        </span>
        <button
          type="button"
          onClick={() => {
            if (confirm("Thoát buổi tập? Tiến độ sẽ không được lưu.")) router.replace("/");
          }}
          className="min-h-11 text-base text-accent"
        >
          Thoát
        </button>
      </header>

      <div className="aspect-square w-full">
        {exercise ? <ExerciseGif src={exercise.gifUrl} alt={exercise.nameVi} size={640} /> : null}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        <h1 className="text-2xl font-bold">{exercise?.nameVi ?? item.exerciseId}</h1>
        <p className="ex-name text-sm text-muted">{exercise?.name}</p>
        <p className="font-mono text-base text-muted tabular-nums">
          Set {setsDone + 1} / {item.sets} · {item.reps} reps
        </p>
        {item.note ? <p className="text-sm text-muted">{item.note}</p> : null}
      </div>

      <div className="safe-b space-y-3 px-4 pb-4">
        <Button onClick={completeSet}>Xong set</Button>
        <button type="button" onClick={() => setGuideOpen(true)} className="w-full py-2 text-base text-accent">
          Xem hướng dẫn
        </button>
      </div>

      {restSec !== null ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-ink/90 px-8 text-white">
          <p className="text-base opacity-70">Nghỉ</p>
          <RestTimer seconds={restSec} onDone={() => setRestSec(null)} />
          <button type="button" onClick={() => setRestSec(null)} className="min-h-11 text-base underline">
            Bỏ qua
          </button>
        </div>
      ) : null}

      <Sheet open={guideOpen} onClose={() => setGuideOpen(false)} title={exercise?.nameVi ?? "Hướng dẫn"}>
        <ol className="list-inside list-decimal space-y-2 text-base leading-relaxed">
          {(exercise?.instructionsVi ?? []).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </Sheet>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
      {children}
    </main>
  );
}
