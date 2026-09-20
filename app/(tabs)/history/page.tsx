"use client";

import { Card } from "@/components/ui/Card";
import { Chip, Label } from "@/components/ui/Chip";
import { useStore } from "@/lib/store";
import { useCatalog } from "@/lib/useCatalog";
import { historyStats, logMinutes, logSets } from "@/lib/stats";
import { Icon } from "@/components/ui/Icon";

const fmt = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "numeric" });
const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" });

export default function HistoryPage() {
  const { logs } = useStore();
  const { catalog } = useCatalog();
  const stats = historyStats(logs);

  return (
    <main className="mx-auto max-w-lg px-4 pb-10 pt-6">
      <h1 className="font-serif text-3xl font-bold tracking-tight">Lịch sử tập</h1>
      <p className="mt-1 text-sm text-muted">Toàn bộ buổi đã hoàn thành, lưu trên máy</p>

      <section className="mt-5 rounded-card bg-surface p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <Label>Tổng kết hoạt động</Label>
          <span className="flex items-center gap-1 text-xs font-semibold text-accent">
            <Icon name="check" className="size-3.5" strokeWidth={2.4} />
            Đồng bộ bộ nhớ máy
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat value={stats.total} label="Buổi hoàn thành" />
          <Stat value={stats.perWeek} label="Buổi / tuần" />
          <Stat value={`${stats.avgMinutes}′`} label="Trung bình" />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
          <Icon name="flame" className="size-4 text-tertiary" />
          Chuỗi tập: {stats.streakWeeks} tuần liên tục
        </p>
      </section>

      <div className="flex items-center justify-between pb-2 pt-7">
        <h2 className="font-serif text-lg font-bold">Dòng thời gian</h2>
        <span className="text-sm text-muted">{logs.length} buổi</span>
      </div>

      {!logs.length ? (
        <p className="py-12 text-center text-muted">Chưa có buổi tập nào được ghi lại.</p>
      ) : null}

      <ol className="relative space-y-3 border-l border-line/60 pl-5">
        {logs.map((log, i) => {
          const date = new Date(log.dateISO);
          return (
            <li key={log.id} className="relative">
              <span
                className={`absolute -left-[1.6rem] top-5 size-3 rounded-full border-2 border-bg ${
                  i === 0 ? "bg-accent" : "bg-line"
                }`}
                aria-hidden
              />
              <Card className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-muted">
                      {fmt.format(date)}, {time.format(date)}
                    </span>
                    <h3 className="mt-0.5 truncate font-serif text-lg font-bold">{log.dayName}</h3>
                  </span>
                  <Chip tone="accent">
                    <Icon name="clock" className="size-3.5" />
                    {logMinutes(log)} phút
                  </Chip>
                </div>

                <p className="mt-2 text-sm text-muted">
                  {log.entries.length} bài tập · {logSets(log)} sets hoàn thành
                </p>

                <details className="group mt-2">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-accent">
                    Xem chi tiết bài tập
                    <Icon
                      name="chevronDown"
                      className="float-right size-4 transition-transform group-open:rotate-180"
                      strokeWidth={2.2}
                    />
                  </summary>
                  <div className="mt-2 divide-y divide-line/50 rounded-card bg-bg px-3">
                    {log.entries.map((entry, j) => (
                      <div key={j} className="flex items-center gap-3 py-2.5">
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {catalog?.byId.get(entry.exerciseId)?.nameVi ?? entry.exerciseId}
                        </span>
                        <span className="font-mono text-sm text-muted tabular-nums">
                          {entry.setsDone} × {entry.repsDone[0] ?? "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              </Card>
            </li>
          );
        })}
      </ol>
    </main>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <span className="rounded-card bg-bg px-2 py-3">
      <span className="block font-serif text-2xl font-bold text-accent tabular-nums">{value}</span>
      <span className="mt-0.5 block text-xs text-muted">{label}</span>
    </span>
  );
}
