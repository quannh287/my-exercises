"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Chip";
import { clearStore, exportJson, importJson, useStore } from "@/lib/store";
import { historyStats } from "@/lib/stats";
import { countItems, WEEK_DAYS } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

export default function MePage() {
  const store = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const stats = historyStats(store.logs);

  const trainingDays = WEEK_DAYS.filter((d) => countItems(store.schedule.days[d]) > 0).length;

  const backupFile = () =>
    new File([exportJson()], `lich-tap-${new Date().toISOString().slice(0, 10)}.json`, {
      type: "application/json",
    });

  const download = () => {
    const file = backupFile();
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const files = [backupFile()];
    if (!navigator.canShare?.({ files })) return download();
    try {
      await navigator.share({ files, title: "Lịch tập" });
    } catch (err) {
      // Huỷ chia sẻ không phải lỗi; mọi thứ khác thì rơi về tải file.
      if ((err as Error).name !== "AbortError") download();
    }
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

      <section className="mt-4 rounded-card bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg text-muted">
            <Icon name="drive" className="size-6" />
          </span>
          <span>
            <h2 className="font-serif text-lg font-bold">Quản lý dữ liệu offline</h2>
            <p className="text-sm text-muted">Lưu trữ cục bộ, không cần internet</p>
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <Button onClick={() => void share()}>
            <span className="flex items-center justify-center gap-2">
              <Icon name="share" className="size-5" />
              Chia sẻ dữ liệu sang máy khác
            </span>
          </Button>
          <Button variant="secondary" onClick={download}>
            <span className="flex items-center justify-center gap-2">
              <Icon name="download" className="size-5" />
              Xuất bản sao lưu (JSON)
            </span>
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <span className="flex items-center justify-center gap-2">
              <Icon name="upload" className="size-5" />
              Nhập file sao lưu (JSON)
            </span>
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

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <span className="rounded-card bg-bg px-2 py-3">
      <span className="block font-serif text-2xl font-bold text-accent tabular-nums">{value}</span>
      <span className="mt-0.5 block text-xs text-muted">{label}</span>
    </span>
  );
}
