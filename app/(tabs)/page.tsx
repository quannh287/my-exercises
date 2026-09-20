"use client";

import Link from "next/link";
import { Chip, Label } from "@/components/ui/Chip";
import { PrefetchMedia } from "@/components/PrefetchMedia";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useStore } from "@/lib/store";
import { useToday } from "@/lib/useToday";
import { useCatalog } from "@/lib/useCatalog";
import { bodyPartLabel } from "@/lib/labels";
import { estimateMinutes, weekProgress } from "@/lib/stats";
import { countItems, DAY_LABEL, DAY_SHORT, flatItems, WEEK_DAYS, type Day, type WeekDay } from "@/lib/types";

export default function SchedulePage() {
  const { schedule, logs } = useStore();
  const today = useToday();
  const { catalog } = useCatalog();
  const week = weekProgress(schedule, logs);

  const todayDay = today ? schedule.days[today] : null;

  return (
    <main className="mx-auto max-w-lg px-4 pb-8 pt-6">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight">Lịch tập trong tuần</h1>
          <p className="mt-1 text-sm text-muted">Chu kỳ 7 ngày cố định · Lưu trữ offline</p>
        </div>
      </div>

      <section className="mt-5 flex items-center gap-4 rounded-card bg-surface p-5 shadow-soft">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M20 4C10 4 4 9 4 16v4M20 4c0 8-5 12-11 12H4" strokeLinecap="round" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <Label>Mục tiêu tuần</Label>
          <span className="mt-0.5 block font-semibold">
            {week.done}/{week.planned || 0} buổi hoàn thành ({week.pct}%)
          </span>
        </span>
        <ProgressRing value={week.planned ? week.done / week.planned : 0}>
          <span className="font-mono text-xs font-semibold tabular-nums">{week.pct}%</span>
        </ProgressRing>
      </section>

      <div className="mt-4 space-y-3">
        {WEEK_DAYS.map((key) =>
          key === today ? (
            <TodayCard
              key={key}
              dayKey={key}
              day={schedule.days[key]}
              names={exerciseNames(schedule.days[key], catalog?.byId)}
              gifUrls={exerciseGifs(schedule.days[key], catalog?.byId)}
            />
          ) : (
            <DayCard key={key} dayKey={key} day={schedule.days[key]} done={week.doneDays.has(key)} />
          ),
        )}
      </div>

      {today && countItems(todayDay) > 0 ? (
        <Link
          href={`/workout/${today}`}
          className="mt-6 flex items-center gap-4 rounded-card bg-accent px-5 py-4 text-white shadow-soft active:bg-accent/85"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15">
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-white/75">
              Bắt đầu ngay hôm nay
            </span>
            <span className="block truncate font-serif text-lg font-bold">Buổi {todayDay?.name}</span>
          </span>
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </main>
  );
}

const exerciseNames = (day: Day | null, byId?: Map<string, { nameVi: string }>) =>
  day ? flatItems(day).map((i) => byId?.get(i.exerciseId)?.nameVi ?? i.exerciseId) : [];

const exerciseGifs = (day: Day | null, byId?: Map<string, { gifUrl: string }>) =>
  day ? flatItems(day).flatMap((i) => byId?.get(i.exerciseId)?.gifUrl ?? []) : [];

function DayBadge({ dayKey, active }: { dayKey: WeekDay; active?: boolean }) {
  return (
    <span
      className={`flex size-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full leading-none ${
        active ? "bg-accent text-white" : "bg-bg text-muted"
      }`}
    >
      {dayKey === "sun" ? null : (
        <span className="text-[0.5rem] font-semibold uppercase tracking-wide">Thứ</span>
      )}
      <span className="font-serif text-base font-bold">{DAY_SHORT[dayKey].replace(/^T/, "")}</span>
    </span>
  );
}

function DayCard({ dayKey, day, done }: { dayKey: WeekDay; day: Day | null; done: boolean }) {
  const n = countItems(day);
  return (
    <Link
      href={`/schedule/${dayKey}`}
      className="flex items-center gap-4 rounded-card bg-surface px-4 py-3.5 shadow-soft active:bg-accent-soft/40"
    >
      <DayBadge dayKey={dayKey} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-serif text-base font-semibold">{day ? day.name : "Ngày nghỉ"}</span>
        <span className="block truncate text-sm text-muted">
          {day ? `${n} bài tập · Dự kiến ${estimateMinutes(day)} phút` : "Phục hồi cơ bắp & nạp năng lượng"}
        </span>
      </span>
      {done ? (
        <Chip tone="accent">✓ Xong</Chip>
      ) : !day ? (
        <Chip tone="amber">Nghỉ</Chip>
      ) : (
        <svg viewBox="0 0 8 14" className="size-3.5 shrink-0 text-muted" aria-hidden>
          <path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </Link>
  );
}

function TodayCard({
  dayKey,
  day,
  names,
  gifUrls,
}: {
  dayKey: WeekDay;
  day: Day | null;
  names: string[];
  gifUrls: string[];
}) {
  if (!day) {
    return (
      <div className="overflow-hidden rounded-card bg-surface shadow-soft">
        <div className="h-1.5 bg-accent" />
        <div className="flex items-center gap-4 px-4 py-3.5">
          <DayBadge dayKey={dayKey} active />
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-base font-semibold">Ngày nghỉ</span>
            <Chip tone="accent" className="mt-1">
              ● Hôm nay
            </Chip>
          </span>
          <Link href={`/schedule/${dayKey}`} className="text-sm font-semibold text-accent">
            Sửa
          </Link>
        </div>
      </div>
    );
  }

  const shown = names.slice(0, 3);
  const rest = names.length - shown.length;

  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-soft">
      <div className="h-1.5 bg-accent" />
      <div className="flex items-start gap-4 px-4 pt-4">
        <DayBadge dayKey={dayKey} active />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-serif text-lg font-bold">{day.name}</span>
          <Chip tone="accent" className="mt-1">
            ● Hôm nay
          </Chip>
          <span className="mt-1.5 block text-sm font-semibold text-accent">
            {names.length} bài tập · Dự kiến {estimateMinutes(day)} phút
          </span>
        </span>
        <Link
          href={`/schedule/${dayKey}`}
          aria-label={`Sửa ${DAY_LABEL[dayKey]}`}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-bg text-muted"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M4 20h4L19 9a2.8 2.8 0 10-4-4L4 16v4z" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {names.length ? (
        <div className="mx-4 mt-4 rounded-card bg-bg p-3">
          <Label>Danh sách bài tập chính</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {shown.map((name, i) => (
              <span key={i} className="truncate rounded-lg bg-surface px-2.5 py-1.5 text-sm">
                {name}
              </span>
            ))}
            {rest > 0 ? <Chip>+{rest} bài</Chip> : null}
          </div>
        </div>
      ) : null}

      {gifUrls.length ? <div className="mx-4 mt-3"><PrefetchMedia urls={gifUrls} /></div> : null}

      <div className="mt-3 flex items-center justify-between px-4 pb-4">
        <span className="truncate text-sm text-muted">
          {day.blocks.map((b) => bodyPartLabel(b.bodyPart)).join(" · ") || "Chưa có nhóm cơ"}
        </span>
        <Link href={`/schedule/${dayKey}`} className="shrink-0 text-sm font-semibold text-accent">
          Xem chi tiết →
        </Link>
      </div>
    </div>
  );
}
