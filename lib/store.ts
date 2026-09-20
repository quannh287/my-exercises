"use client";

import { useSyncExternalStore } from "react";
import { WEEK_DAYS, type Store, type Schedule, type WeekDay } from "./types";

const KEY = "workout.v1";
const DB = "workout";

const emptySchedule = (): Schedule => ({
  days: Object.fromEntries(WEEK_DAYS.map((d) => [d, null])) as Schedule["days"],
});

export const emptyStore = (): Store => ({ schedule: emptySchedule(), logs: [] });

function parse(raw: string | null): Store {
  if (!raw) return emptyStore();
  try {
    const parsed = JSON.parse(raw) as Partial<Store>;
    const days = { ...emptySchedule().days, ...parsed.schedule?.days };
    return {
      schedule: { days },
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    };
  } catch {
    return emptyStore(); // corrupt payload beats a blank screen; the user can re-import
  }
}

// localStorage throws in Safari private mode and when site data is blocked — never let that crash a render.
function read(): Store {
  try {
    return parse(localStorage.getItem(KEY));
  } catch {
    return emptyStore();
  }
}

let cache: Store | null = null;
let written = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getStore(): Store {
  cache ??= read();
  return cache;
}

export function setStore(next: Store | ((prev: Store) => Store)) {
  const value = typeof next === "function" ? next(getStore()) : next;
  cache = value;
  written = true;
  const raw = JSON.stringify(value);
  try {
    localStorage.setItem(KEY, raw);
  } catch (err) {
    console.error("Không lưu được vào localStorage", err);
  }
  kv("readwrite", (store) => store.put(raw, KEY)).catch((err) =>
    console.error("Không lưu được vào IndexedDB", err),
  );
  emit();
}

// Safari xoá localStorage sau 7 ngày không mở app, nên IndexedDB giữ bản bền; localStorage chỉ còn là cache đọc đồng bộ cho lần vẽ đầu.
function kv<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }).then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = run(db.transaction(DB, mode).objectStore(DB));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

/** Nạp bản bền từ IndexedDB sau lần vẽ đầu; gọi một lần lúc app khởi động. */
export function hydrate() {
  if (typeof indexedDB === "undefined") return;
  navigator.storage?.persist?.().catch(() => {}); // xin trình duyệt đừng dọn dữ liệu khi máy hết chỗ
  kv<string | undefined>("readonly", (store) => store.get(KEY))
    .then((saved) => {
      if (written) return; // người dùng đã ghi trong lúc chờ — bản trong tay mới hơn
      if (saved === undefined) return void setStore(getStore()); // lần đầu: đẩy localStorage sang IndexedDB
      cache = parse(saved);
      emit();
    })
    .catch((err) => console.error("Không đọc được IndexedDB", err));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

const serverSnapshot = emptyStore();

export function useStore() {
  return useSyncExternalStore(subscribe, getStore, () => serverSnapshot);
}

export function useDay(key: WeekDay) {
  return useStore().schedule.days[key];
}

export const exportJson = () => JSON.stringify(getStore(), null, 2);

export function importJson(raw: string): Store {
  const parsed = JSON.parse(raw) as Partial<Store>;
  if (!parsed || typeof parsed !== "object" || !parsed.schedule?.days) {
    throw new Error("File không đúng định dạng backup của app");
  }
  const store = parse(JSON.stringify(parsed));
  setStore(store);
  return store;
}

export function clearStore() {
  setStore(emptyStore());
}

export const uid = () => Math.random().toString(36).slice(2, 10);
