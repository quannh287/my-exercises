"use client";

import { useSyncExternalStore } from "react";
import { commit, getStore, kv, writeListeners } from "./store";
import { merge, sameStore } from "./merge";
import { validateStore } from "./types";

const CODE_KEY = "workout.sync";
const CODE_RE = /^[0-9a-f-]{36}$/;
const PUSH_DELAY = 2000;

export type SyncState = {
  code: string | null;
  status: "off" | "syncing" | "ok" | "error";
  error?: string;
  at?: number;
};

let state: SyncState = { code: null, status: "off" };
const listeners = new Set<() => void>();

function set(patch: Partial<SyncState>) {
  state = { ...state, ...patch };
  for (const l of listeners) l();
}

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

async function api<T>(method: "GET" | "PUT", code: string, body?: unknown): Promise<T> {
  const res = await fetch("/api/sync", {
    method,
    cache: "no-store",
    headers: { authorization: `Bearer ${code}`, ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError(res.status, json.error ?? `HTTP ${res.status}`);
  return json as T;
}

type Remote = { version: number; data: unknown };

async function pull(code: string): Promise<Remote | null> {
  try {
    return await api<Remote>("GET", code);
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) return null;
    throw err;
  }
}

let running = false;
let again = false;

/** Kéo bản cloud, gộp với máy, đẩy bản gộp lên; 409 nghĩa là máy khác vừa ghi nên gộp lại từ đầu. */
export async function syncNow(): Promise<void> {
  const code = state.code;
  if (!code) return;
  if (running) return void (again = true);
  running = true;
  set({ status: "syncing", error: undefined });
  try {
    for (let attempt = 0; ; attempt++) {
      const remote = await pull(code);
      const remoteStore = remote ? validateStore(remote.data) : null;
      const merged = remoteStore ? merge(getStore(), remoteStore) : getStore();
      if (!sameStore(merged, getStore())) commit(merged);
      if (remoteStore && sameStore(merged, remoteStore)) break;
      try {
        await api("PUT", code, { version: remote?.version ?? 0, data: merged });
        break;
      } catch (err) {
        if (!(err instanceof HttpError && err.status === 409) || attempt >= 3) throw err;
      }
    }
    set({ status: "ok", at: Date.now() });
  } catch (err) {
    // Không retry ở đây: lần sửa kế tiếp, lúc có mạng lại hoặc lúc mở app sẽ tự thử lại.
    console.error("sync failed", err);
    set({ status: "error", error: err instanceof Error ? err.message : "Không đồng bộ được" });
  } finally {
    running = false;
    if (again) {
      again = false;
      void syncNow();
    }
  }
}

let timer: ReturnType<typeof setTimeout> | undefined;
const pushSoon = () => {
  clearTimeout(timer);
  timer = setTimeout(() => void syncNow(), PUSH_DELAY);
};

async function saveCode(code: string | null) {
  try {
    if (code) localStorage.setItem(CODE_KEY, code);
    else localStorage.removeItem(CODE_KEY);
  } catch {}
  const write = code
    ? kv("readwrite", (s) => s.put(code, CODE_KEY))
    : kv("readwrite", (s) => s.delete(CODE_KEY));
  await write.catch((err) => console.error("Không lưu được mã đồng bộ", err));
}

/** Gọi sau `hydrate()`: nạp mã đã lưu và bắt đầu đồng bộ nếu đã bật. */
export async function startSync() {
  let code: string | null = null;
  try {
    code = localStorage.getItem(CODE_KEY);
  } catch {}
  code ??= (await kv<string | undefined>("readonly", (s) => s.get(CODE_KEY)).catch(() => undefined)) ?? null;
  writeListeners.add(pushSoon);
  window.addEventListener("online", () => void syncNow());
  if (code && CODE_RE.test(code)) {
    set({ code, status: "ok" });
    await syncNow();
  }
}

/** Bật đồng bộ trên máy này bằng mã mới hoặc mã của máy khác. */
export async function enableSync(code = crypto.randomUUID()) {
  code = code.trim().toLowerCase();
  if (!CODE_RE.test(code)) throw new Error("Mã đồng bộ không đúng định dạng");
  if (code !== state.code) {
    // Máy mới nối vào: gộp dữ liệu chứ không để epoch của máy này xoá bản cloud (hoặc ngược lại).
    const remote = await pull(code);
    if (remote) {
      const cloud = validateStore(remote.data);
      commit(merge({ ...getStore(), epoch: cloud.epoch }, cloud));
    }
  }
  await saveCode(code);
  set({ code, status: "ok" });
  await syncNow();
}

/** Mã nằm sau `#` nên không bao giờ tới server hay log truy cập. */
export const shareLink = (code: string) => `${location.origin}/me#sync=${code}`;

/** Mã trong link vừa mở (quét QR bằng camera), rồi xoá khỏi thanh địa chỉ để không lưu vào lịch sử. */
export function takeLinkCode(): string | null {
  const code = new URLSearchParams(location.hash.slice(1)).get("sync");
  if (code === null) return null;
  history.replaceState(null, "", location.pathname + location.search);
  return code;
}

export async function disableSync() {
  await saveCode(null);
  set({ code: null, status: "off", error: undefined });
}

export function useSync() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => void listeners.delete(l)),
    () => state,
    () => state,
  );
}
