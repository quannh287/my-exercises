"use client";

import { useEffect } from "react";
import { hydrate } from "@/lib/store";

export function RegisterSW() {
  useEffect(hydrate, []);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => console.error("SW register failed", err));
  }, []);
  return null;
}
