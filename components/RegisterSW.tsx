"use client";

import { useEffect } from "react";
import { useReminderTicker } from "@/lib/reminder";

export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => console.error("SW register failed", err));
  }, []);
  useReminderTicker();
  return null;
}
