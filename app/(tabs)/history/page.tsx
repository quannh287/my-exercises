"use client";

import { AppBar } from "@/components/ui/AppBar";
import { Card } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { useCatalog } from "@/lib/useCatalog";

const fmt = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "numeric" });

export default function HistoryPage() {
  const { logs } = useStore();
  const { catalog } = useCatalog();

  return (
    <main className="mx-auto max-w-lg pb-10">
      <AppBar title="Lịch sử tập" />

      {!logs.length ? (
        <p className="px-4 py-16 text-center text-muted">Chưa có buổi tập nào được ghi lại.</p>
      ) : null}

      <div className="space-y-6 px-4 pt-5">
        {logs.map((log) => {
          const minutes = Math.max(1, Math.round((log.finishedAt - log.startedAt) / 60000));
          return (
            <section key={log.id}>
              <div className="flex items-baseline justify-between pb-2">
                <h2 className="text-base font-semibold">{log.dayName}</h2>
                <span className="font-mono text-sm text-muted tabular-nums">
                  {fmt.format(new Date(log.dateISO))} · {minutes}′
                </span>
              </div>
              <Card>
                {log.entries.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 not-last:border-b not-last:border-line">
                    <span className="min-w-0 flex-1 truncate text-base">
                      {catalog?.byId.get(entry.exerciseId)?.nameVi ?? entry.exerciseId}
                    </span>
                    <span className="font-mono text-sm text-muted tabular-nums">
                      {entry.setsDone} × {entry.repsDone[0] ?? "—"}
                    </span>
                  </div>
                ))}
              </Card>
            </section>
          );
        })}
      </div>
    </main>
  );
}
