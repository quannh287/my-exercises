"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderSVG } from "uqr";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Chip";
import { clearStore, exportJson, importJson, useStore } from "@/lib/store";
import { historyStats } from "@/lib/stats";
import { countItems, WEEK_DAYS } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { disableSync, enableSync, shareLink, syncNow, takeLinkCode, useSync } from "@/lib/sync";

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

  const MAX_BACKUP = 5 * 1024 * 1024;

  const onFile = async (file: File) => {
    try {
      if (file.size > MAX_BACKUP) throw new Error("File quá lớn, không phải bản sao lưu của app");
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

      <SyncSection />

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
              if (confirm("Xoá toàn bộ lịch và lịch sử, kể cả trên các máy đang đồng bộ? Không khôi phục được nếu chưa xuất file.")) {
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
        <a
          href="https://github.com/yuhonas/free-exercise-db"
          className="text-accent"
          target="_blank"
          rel="noreferrer"
        >
          free-exercise-db
        </a>{" "}
        (public domain)
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

const STATUS: Record<string, string> = {
  syncing: "Đang đồng bộ…",
  ok: "Đã đồng bộ",
  error: "Lỗi đồng bộ",
};

function SyncSection() {
  const sync = useSync();
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [showQr, setShowQr] = useState(false);
  const link = sync.code ? shareLink(sync.code) : null;
  const qr = useMemo(() => (link ? renderSVG(link, { border: 2 }) : ""), [link]);

  const run = async (fn: () => Promise<void>, done?: string) => {
    setMessage(null);
    try {
      await fn();
      if (done) setMessage(done);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Không đồng bộ được");
    }
  };

  useEffect(() => {
    const code = takeLinkCode(); // đọc một lần: link đã bị xoá khỏi URL nên StrictMode chạy lại cũng không hỏi hai lần
    if (code && confirm("Nối máy này với dữ liệu đồng bộ từ link? Dữ liệu hai bên sẽ được gộp lại."))
      enableSync(code).then(
        () => setMessage("Đã nối với máy khác."),
        (err: Error) => setMessage(err.message),
      );
  }, []);

  const shareCode = async () => {
    if (!link) return;
    try {
      if (navigator.share) return await navigator.share({ title: "Đồng bộ lịch tập", url: link });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
    await navigator.clipboard.writeText(link);
    setMessage("Đã chép link.");
  };

  return (
    <section className="mt-4 rounded-card bg-surface p-5 shadow-soft">
      <h2 className="font-serif text-lg font-bold">Đồng bộ giữa các máy</h2>
      {sync.code ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted">
            {STATUS[sync.status]}
            {sync.status === "ok" && sync.at ? ` lúc ${new Date(sync.at).toLocaleTimeString("vi-VN")}` : ""}
            {sync.error ? ` — ${sync.error}` : ""}
          </p>
          <div className="rounded-card bg-bg p-3">
            <Label>Mã đồng bộ — nhập mã này ở máy khác, và cất ở nơi an toàn</Label>
            <p className="mt-1.5 break-all font-mono text-sm select-all">{sync.code}</p>
          </div>
          {showQr ? (
            <div className="space-y-2 rounded-card bg-white p-3">
              <div className="mx-auto max-w-56 [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
              <p className="text-center text-xs text-neutral-600">Quét bằng camera của máy kia để nối dữ liệu</p>
            </div>
          ) : null}
          <Button variant="secondary" onClick={() => setShowQr((v) => !v)}>
            {showQr ? "Ẩn mã QR" : "Hiện mã QR"}
          </Button>
          <Button variant="secondary" onClick={() => void run(shareCode)}>
            <span className="flex items-center justify-center gap-2">
              <Icon name="share" className="size-5" />
              Chia sẻ link đồng bộ
            </span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => void run(() => navigator.clipboard.writeText(sync.code!), "Đã chép mã.")}
          >
            <span className="flex items-center justify-center gap-2">
              <Icon name="copy" className="size-5" />
              Chép mã
            </span>
          </Button>
          <Button variant="secondary" disabled={sync.status === "syncing"} onClick={() => void run(syncNow)}>
            Đồng bộ ngay
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("Tắt đồng bộ trên máy này? Dữ liệu trên máy và trên cloud vẫn giữ nguyên."))
                void run(disableSync);
            }}
          >
            Tắt đồng bộ trên máy này
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted">
            Lưu một bản trên cloud để không mất dữ liệu khi xoá trình duyệt hay đổi máy. Không cần tài khoản — ai có
            mã là xem và sửa được, nên đừng chia sẻ mã.
          </p>
          <Button onClick={() => void run(() => enableSync(), "Đã bật đồng bộ.")}>Bật đồng bộ</Button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hoặc dán mã từ máy khác"
            aria-label="Mã đồng bộ"
            className="w-full rounded-card bg-bg px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
          <Button
            variant="secondary"
            disabled={!input.trim()}
            onClick={() => void run(() => enableSync(input), "Đã nối với máy khác.")}
          >
            Nối bằng mã
          </Button>
        </div>
      )}
      {message ? <p className="mt-3 text-center text-sm text-muted">{message}</p> : null}
    </section>
  );
}
