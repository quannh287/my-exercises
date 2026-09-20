"use client";

import { useSyncExternalStore } from "react";
import { WEEK_DAYS, type Store, type Schedule, type WeekDay } from "./types";

const KEY = "workout.v1";

const emptySchedule = (): Schedule => ({
  days: Object.fromEntries(WEEK_DAYS.map((d) => [d, null])) as Schedule["days"],
});

export const emptyStore = (): Store => ({ schedule: emptySchedule(), logs: [] });

function parse(raw: string | null): Store {
  if (!raw) return emptyStore();
  try {
    const parsed = JSON.parse(raw) as Partial<Store>;
    const days = { ...emptySchedule().days, ...parsed.schedule?.days };
    return { schedule: { days }, logs: Array.isArray(parsed.logs) ? parsed.logs : [] };
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
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch (err) {
    console.error("Không lưu được vào localStorage", err);
  }
  emit();
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
