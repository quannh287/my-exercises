"use client";

import { useEffect } from "react";
import { getStore, setStore } from "./store";
import { countItems, isDue, todayKey, type Reminder } from "./types";

const FIRED_KEY = "workout.reminder.fired";
const localDate = (d: Date) => d.toLocaleDateString("sv");

export const canNotify = () => typeof Notification !== "undefined";

export async function askPermission(): Promise<NotificationPermission> {
  if (!canNotify()) return "denied";
  return Notification.permission === "default" ? Notification.requestPermission() : Notification.permission;
}

async function show(title: string, body: string) {
  const reg = await navigator.serviceWorker?.getRegistration();
  // A SW notification survives the tab closing; plain `new Notification` is the desktop fallback.
  if (reg) return reg.showNotification(title, { body, icon: "/icon-192.png", tag: "workout-reminder" });
  new Notification(title, { body, icon: "/icon-192.png", tag: "workout-reminder" });
}

function tick() {
  if (!canNotify() || Notification.permission !== "granted") return;
  const { reminder, schedule } = getStore();
  if (!reminder.enabled) return;

  const now = new Date();
  const stamp = localDate(now);
  try {
    if (localStorage.getItem(FIRED_KEY) === stamp) return;
  } catch {
    return; // no storage means no dedupe; better silent than a notification every minute
  }

  if (!isDue(reminder, now)) return;

  const day = schedule.days[todayKey(now)];
  if (!day || countItems(day) === 0) return;

  try {
    localStorage.setItem(FIRED_KEY, stamp);
  } catch {}
  void show("Sắp tới giờ tập 💪", `${day.name} — ${countItems(day)} bài, bắt đầu lúc ${reminder.time}.`);
}

/** Only runs while the app is open: no push server, so nothing fires with every tab closed. */
export function useReminderTicker() {
  useEffect(() => {
    tick();
    const id = setInterval(tick, 60_000);
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}

export function setReminder(patch: Partial<Reminder>) {
  setStore((prev) => ({ ...prev, reminder: { ...prev.reminder, ...patch } }));
}
