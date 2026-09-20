"use client";

import { useRef, useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Button } from "@/components/ui/Button";
import { clearStore, exportJson, importJson, useStore } from "@/lib/store";
import { countItems, WEEK_DAYS } from "@/lib/types";

export default function MePage() {
  const store = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

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
    <main className="mx-auto max-w-lg pb-10">
      <AppBar title="Tôi" />

      <Card className="mx-4 mt-5">
        <ListRow title="Ngày tập mỗi tuần" right={<span className="font-mono tabular-nums">{trainingDays}</span>} />
        <ListRow title="Buổi đã hoàn thành" right={<span className="font-mono tabular-nums">{store.logs.length}</span>} />
        <ListRow title="Lịch sử tập" href="/history" />
      </Card>

      <div className="mt-8 space-y-3 px-4">
        <Button variant="secondary" onClick={download}>
          Xuất dữ liệu (JSON)
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          Nhập dữ liệu từ file
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
          Xoá toàn bộ dữ liệu
        </Button>
        {message ? <p className="text-center text-sm text-muted">{message}</p> : null}
      </div>

      <p className="px-4 pt-10 text-center text-xs leading-relaxed text-muted">
        Dữ liệu chỉ nằm trong trình duyệt này (localStorage). Xoá site data là mất — nhớ xuất file để backup.
        <br />
        Bài tập &amp; hình ảnh từ{" "}
        <a href="https://oss.exercisedb.dev/docs" className="text-accent" target="_blank" rel="noreferrer">
          ExerciseDB
        </a>
        .
      </p>
    </main>
  );
}
