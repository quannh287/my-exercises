"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Chip";
import { askPermission, canNotify, setReminder } from "@/lib/reminder";
import { clearStore, exportJson, importJson, useStore } from "@/lib/store";
import { historyStats } from "@/lib/stats";
import { countItems, WEEK_DAYS, type Reminder } from "@/lib/types";

export default function MePage() {
  const store = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const stats = historyStats(store.logs);

  const trainingDays = WEEK_DAYS.filter((d) => countItems(store.schedule.days[d]) > 0).length;

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportJson()], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `lich-tap-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (file: File) => {
    try {
      importJson(await file.text());
      setMessage("Đã khôi phục dữ liệu.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Không đọc được file.");
    }
  };

  return (
    <main className="mx-auto max-w-lg px-4 pb-10 pt-6">
      <h1 className="font-serif text-3xl font-bold tracking-tight">Tôi</h1>
      <p className="mt-1 text-sm text-muted">Hoạt động 100% offline, dữ liệu nằm trên máy bạn</p>

      <section className="mt-5 grid grid-cols-3 gap-2 rounded-card bg-surface p-4 text-center shadow-soft">
        <Stat value={trainingDays} label="Ngày tập / tuần" />
        <Stat value={stats.total} label="Buổi hoàn thành" />
        <Stat value={`${stats.streakWeeks}`} label="Tuần liên tục" />
      </section>

      <ReminderCard reminder={store.reminder} />

      <section className="mt-4 rounded-card bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg text-lg" aria-hidden>
            💾
          </span>
          <span>
            <h2 className="font-serif text-lg font-bold">Quản lý dữ liệu offline</h2>
            <p className="text-sm text-muted">Lưu trữ cục bộ, không cần internet</p>
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <Button onClick={download}>↓ Xuất bản sao lưu (JSON)</Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            ↑ Nhập file sao lưu (JSON)
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void onFile(file);
            }}
          />
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("Xoá toàn bộ lịch và lịch sử? Không khôi phục được nếu chưa xuất file.")) {
                clearStore();
                setMessage("Đã xoá dữ liệu.");
              }
            }}
          >
            Xoá toàn bộ dữ liệu ứng dụng
          </Button>
          {message ? <p className="text-center text-sm text-muted">{message}</p> : null}
        </div>

        <div className="mt-4 rounded-card bg-bg p-3">
          <Label>Cơ chế LocalStorage</Label>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Toàn bộ lịch, mức tạ và thiết lập được ghi thẳng vào LocalStorage của thiết bị. Khi đổi trình duyệt
            hoặc xoá cache, hãy dùng <strong className="font-semibold text-ink">Xuất bản sao lưu</strong> để giữ
            dữ liệu.
          </p>
        </div>
      </section>

      <p className="px-2 pt-6 text-center text-xs leading-relaxed text-muted">
        Bài tập &amp; hình ảnh từ{" "}
        <a href="https://oss.exercisedb.dev/docs" className="text-accent" target="_blank" rel="noreferrer">
          ExerciseDB
        </a>
        .
      </p>
    </main>
  );
}

function ReminderCard({ reminder }: { reminder: Reminder }) {
  const [asked, setAsked] = useState<NotificationPermission | null>(null);
  // `null` on the server: Notification.permission only exists in the browser.
  const permission = useSyncExternalStore(
    () => () => {},
    () => asked ?? (canNotify() ? Notification.permission : "denied"),
    () => null,
  );

  const enable = async (on: boolean) => {
    if (on) {
      const result = await askPermission();
      setAsked(result);
      if (result !== "granted") return;
    }
    setReminder({ enabled: on });
  };

  return (
    <section className="mt-4 rounded-card bg-surface p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg text-lg" aria-hidden>
          🔔
        </span>
        <span className="flex-1">
          <h2 className="font-serif text-lg font-bold">Nhắc trước giờ tập</h2>
          <p className="text-sm text-muted">Thông báo ngay trên máy, không qua server</p>
        </span>
        <input
          type="checkbox"
          aria-label="Bật nhắc giờ tập"
          className="size-6 accent-accent"
          checked={reminder.enabled}
          onChange={(e) => void enable(e.target.checked)}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="rounded-card bg-bg px-3 py-2">
          <Label>Giờ tập</Label>
          <input
            type="time"
            value={reminder.time}
            onChange={(e) => setReminder({ time: e.target.value })}
            className="mt-1 w-full bg-transparent font-serif text-lg font-bold tabular-nums outline-none"
          />
        </label>
        <label className="rounded-card bg-bg px-3 py-2">
          <Label>Nhắc trước</Label>
          <select
            value={reminder.leadMin}
            onChange={(e) => setReminder({ leadMin: Number(e.target.value) })}
            className="mt-1 w-full bg-transparent font-serif text-lg font-bold outline-none"
          >
            {[10, 15, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} phút
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        {permission === "denied"
          ? "Trình duyệt đang chặn thông báo — bật lại trong cài đặt trang web."
          : "Chỉ bắn khi app đang mở hoặc vừa được mở lại (không có server push). Cài app ra màn hình chính để nhận đều hơn."}
      </p>
    </section>
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
