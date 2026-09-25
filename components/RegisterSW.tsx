"use client";

import { useEffect } from "react";
import { hydrate } from "@/lib/store";
import { startSync } from "@/lib/sync";

export function RegisterSW() {
  useEffect(() => {
    void hydrate().then(startSync); // đồng bộ phải gộp với bản IndexedDB, không phải bản localStorage có thể đã bị xoá
  }, []);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => console.error("SW register failed", err));
  }, []);
  return null;
}
