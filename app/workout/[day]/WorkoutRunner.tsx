"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip, Label } from "@/components/ui/Chip";
import { ExerciseGif } from "@/components/ExerciseGif";
import { RestTimer } from "@/components/RestTimer";
import { Sheet } from "@/components/ui/Sheet";
import { Stepper } from "@/components/ui/Stepper";
import { equipmentLabel } from "@/lib/labels";
import { setStore, uid, useStore } from "@/lib/store";
import { lastWeight, logVolume, volumeDelta } from "@/lib/stats";
import { useCatalog, useDetails } from "@/lib/useCatalog";
import { completeSet as advance, setItemWeight, startProgress, type Progress } from "@/lib/workout";
import { DAY_LABEL, flatItems, type Log, type LogEntry, type WeekDay } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

export function WorkoutRunner({ dayKey }: { dayKey: WeekDay }) {
  const router = useRouter();
  const store = useStore();
  const day = store.schedule.days[dayKey];
  const { catalog } = useCatalog();

  const items = useMemo(() => (day ? flatItems(day) : []), [day]);
  const [startedAt] = useState(() => Date.now());
  const [finishedLog, setFinishedLog] = useState<Log | null>(null);
  const [progress, setProgress] = useState<Progress>(startProgress);
  const [rest, setRest] = useState<{ until: number; total: number } | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const { index, setsDone } = progress;
  const item = items[index];
  const exercise = item ? catalog?.byId.get(item.exerciseId) : undefined;
  const details = useDetails(guideOpen ? item?.exerciseId : undefined);

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
      setFinishedLog(log);
    },
    [day, dayKey, startedAt],
  );

  const completeSet = () => {
    const { next, rest: restSec, finished: done } = advance(items, progress);
    setProgress(next);
    if (done) saveLog(next.entries);
    else if (restSec > 0) setRest({ until: Date.now() + restSec * 1000, total: restSec });
  };

  if (!day || !items.length) {
    return (
      <Centered>
        <p className="text-muted">Buổi này chưa có bài nào.</p>
        <Button onClick={() => router.replace(`/schedule/${dayKey}`)}>Thiết lập buổi tập</Button>
      </Centered>
    );
  }

  if (finishedLog) {
    const minutes = Math.max(1, Math.round((finishedLog.finishedAt - finishedLog.startedAt) / 60000));
    const delta = volumeDelta(store.logs, finishedLog);
    return (
      <Centered>
        <span className="grid size-16 place-items-center rounded-full bg-accent-soft text-accent">
          <Icon name="check" className="size-8" strokeWidth={2.2} />
        </span>
        <h1 className="font-serif text-2xl font-bold">Xong buổi {day.name}</h1>
        <p className="text-muted">
          {items.length} bài · {minutes} phút · {logVolume(finishedLog).toLocaleString("vi-VN")} kg
        </p>
        {delta !== null ? (
          <p className={`text-sm font-semibold ${delta >= 0 ? "text-accent" : "text-danger"}`}>
            {delta >= 0 ? "+" : "−"}
            {Math.abs(delta)}% so với tuần trước
          </p>
        ) : null}
        <Button onClick={() => router.replace("/history")}>Xem lịch sử</Button>
        <Button variant="secondary" onClick={() => router.replace("/")}>
          Về lịch tập
        </Button>
      </Centered>
    );
  }

  const pct = Math.round((index / items.length) * 100);

  const setWeight = (weight: number) =>
    setStore((s) => ({
      ...s,
      schedule: { days: { ...s.schedule.days, [dayKey]: setItemWeight(day, item.id, weight) } },
    }));

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="sticky top-0 z-30 border-b border-line/50 bg-surface/95 px-4 pb-2 pt-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-accent">
            <span className="size-2 rounded-full bg-accent" aria-hidden />
            Đang tập trực tiếp
          </span>
          <button
            type="button"
            onClick={() => {
              if (confirm("Thoát buổi tập? Tiến độ sẽ không được lưu.")) router.replace("/");
            }}
            className="min-h-9 text-sm font-semibold text-danger"
          >
            <span className="flex items-center gap-1">
              <Icon name="x" className="size-4" strokeWidth={2.2} />
              Huỷ phiên
            </span>
          </button>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <h1 className="truncate font-serif text-lg font-bold">
            {DAY_LABEL[dayKey]}: {day.name}
          </h1>
          <span className="shrink-0 font-mono text-sm text-muted tabular-nums">
            Bài {index + 1}/{items.length} · {pct}%
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line/50">
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-card bg-surface shadow-soft">
          <div className="aspect-[4/3] w-full">
            {exercise ? <ExerciseGif src={exercise.gifUrl} alt={exercise.nameVi} size={640} /> : null}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/80 to-transparent p-4">
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                Mục tiêu chính
              </span>
              <span className="block truncate font-serif text-base font-bold capitalize text-white">
                {exercise?.targetMuscles.join(", ") ?? "—"}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="shrink-0 rounded-full bg-surface px-3.5 py-2 text-sm font-semibold text-ink"
            >
              Kỹ thuật
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 pt-4">
        <span className="min-w-0 flex-1">
          <h2 className="truncate font-serif text-2xl font-bold">{exercise?.nameVi ?? item.exerciseId}</h2>
          <p className="ex-name truncate text-sm text-muted">
            {exercise?.name}
            {exercise?.equipments.length ? ` · ${exercise.equipments.map(equipmentLabel).join(", ")}` : ""}
          </p>
        </span>
        <Chip>
          {item.sets} hiệp{item.weight ? ` · ${item.weight}kg` : ""}
        </Chip>
      </div>

      <div className="px-4 pt-4">
        <Stepper
          label="Tạ"
          unit="kg"
          value={item.weight ?? 0}
          onChange={setWeight}
          steps={[2.5, 5]}
          max={500}
          ghost={lastWeight(store.logs, item.exerciseId)}
        />
      </div>

      <div className="flex items-center justify-between px-4 pb-2 pt-5">
        <Label>Chi tiết các hiệp</Label>
        <span className="text-sm text-muted">Nghỉ {item.restSec}s</span>
      </div>

      <ol className="space-y-2 px-4">
        {Array.from({ length: item.sets }, (_, i) => {
          const state = i < setsDone ? "done" : i === setsDone ? "current" : "todo";
          return (
            <li
              key={i}
              className={`flex items-center gap-3 rounded-card px-3 py-3 ${
                state === "current" ? "bg-accent text-white shadow-soft" : "bg-surface shadow-soft"
              }`}
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full font-mono text-sm tabular-nums ${
                  state === "current" ? "bg-white text-accent" : state === "done" ? "bg-accent-soft text-accent" : "bg-bg text-muted"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-semibold">{item.reps} lần lặp</span>
                  {state === "current" ? (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide">
                      Hiện tại
                    </span>
                  ) : null}
                </span>
                {item.note ? (
                  <span className={`block truncate text-sm ${state === "current" ? "text-white/80" : "text-muted"}`}>
                    {item.note}
                  </span>
                ) : null}
              </span>
              {state === "done" ? (
                <Chip tone="accent">
                  <Icon name="check" className="size-3.5" strokeWidth={2.4} />
                  Đã xong
                </Chip>
              ) : state === "current" ? (
                <span className="shrink-0 text-sm font-semibold">Đang tập</span>
              ) : (
                <span className="shrink-0 text-sm text-muted">Chờ lượt</span>
              )}
            </li>
          );
        })}
      </ol>

      {rest ? (
        <section className="mx-4 mt-5 rounded-card bg-surface p-5 text-center shadow-soft">
          <div className="flex items-center justify-between">
            <Label>Đồng hồ nghỉ hồi phục</Label>
            <span className="text-sm text-muted">Chuẩn bị set {setsDone + 1}</span>
          </div>
          <div className="mt-4 flex justify-center">
            <RestTimer until={rest.until} total={rest.total} onDone={() => setRest(null)} />
          </div>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Thả lỏng, hít thở sâu và nhấp một ngụm nước trước khi vào set tiếp theo.
          </p>
          <div className="mt-4 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setRest((r) => (r ? { until: r.until + 30_000, total: r.total + 30 } : r))}
            >
              +30 giây
            </Button>
            <Button variant="secondary" onClick={() => setRest(null)}>
              Bỏ qua nghỉ
            </Button>
          </div>
        </section>
      ) : null}

      <div className="safe-b sticky bottom-0 mt-6 bg-bg/95 px-4 pb-4 pt-3 backdrop-blur">
        <Button onClick={completeSet}>
          <span className="flex items-center justify-center gap-2">
            <Icon name="check" className="size-5" strokeWidth={2.4} />
            Hoàn thành set {setsDone + 1}
          </span>
        </Button>
        <p className="mt-2 text-center text-xs text-muted">
          Tự động đếm ngược {item.restSec} giây sau khi bấm
        </p>
      </div>

      <Sheet open={guideOpen} onClose={() => setGuideOpen(false)} title={exercise?.nameVi ?? "Hướng dẫn"}>
        <ol className="list-inside list-decimal space-y-2 text-base leading-relaxed">
          {(details?.instructionsVi ?? []).map((step, i) => (
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
