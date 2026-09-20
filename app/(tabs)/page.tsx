"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { useStore } from "@/lib/store";
import { useToday } from "@/lib/useToday";
import { countItems, DAY_LABEL, DAY_SHORT, WEEK_DAYS } from "@/lib/types";

export default function SchedulePage() {
  const { schedule } = useStore();
  const today = useToday();

  return (
    <main className="mx-auto max-w-lg px-4 pb-8 pt-6">
      <h1 className="text-3xl font-bold tracking-tight">Lịch tập</h1>
      <p className="mt-1 text-sm text-muted">Lặp lại mỗi tuần. Chạm vào một ngày để sửa.</p>

      <Card className="mt-5">
        {WEEK_DAYS.map((key) => {
          const day = schedule.days[key];
          const n = countItems(day);
          const isToday = today === key;
          return (
            <ListRow
              key={key}
              href={`/schedule/${key}`}
              muted={!day}
              title={
                <span className="flex items-center gap-2">
                  <span className="w-7 font-mono text-sm text-muted tabular-nums">{DAY_SHORT[key]}</span>
                  <span className={isToday ? "font-semibold" : undefined}>{day ? day.name : "Nghỉ"}</span>
                  {isToday ? (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                      Hôm nay
                    </span>
                  ) : null}
                </span>
              }
              right={n ? <span className="text-sm text-muted">{n} bài</span> : null}
            />
          );
        })}
      </Card>

      {today && countItems(schedule.days[today]) > 0 ? (
        <Link
          href={`/workout/${today}`}
          className="mt-6 flex h-13 items-center justify-center rounded-full bg-accent text-base font-semibold text-white active:bg-accent/85"
        >
          Bắt đầu buổi {DAY_LABEL[today].toLowerCase()}
        </Link>
      ) : null}
    </main>
  );
}
