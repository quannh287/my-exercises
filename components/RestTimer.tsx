"use client";

import { useEffect, useRef, useState } from "react";
import { ProgressRing } from "@/components/ui/ProgressRing";

const left = (until: number) => Math.max(0, Math.ceil((until - Date.now()) / 1000));

/**
 * Counts down against a wall-clock deadline: background tabs throttle intervals,
 * so accumulating ticks would drift badly over a 90s rest. The deadline lives in the
 * parent so "+30s" extends the rest instead of restarting it.
 */
export function RestTimer({ until, total, onDone }: { until: number; total: number; onDone: () => void }) {
  const [secs, setSecs] = useState(() => left(until));
  // Held in a ref: an inline onDone would otherwise change identity and restart the timer.
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // The first tick lands within 250ms, so no synchronous catch-up setState is needed.
    const id = setInterval(() => {
      const remaining = left(until);
      setSecs(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        // Ngắt quãng để nhận ra được khi máy nằm trong túi giữa phòng gym ồn.
        navigator.vibrate?.([120, 80, 120, 80, 240]);
        done.current();
      }
    }, 250);
    return () => clearInterval(id);
  }, [until]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <ProgressRing value={total ? secs / total : 0} size={160} stroke={10}>
      <span className="block font-mono text-3xl font-bold tabular-nums">
        {mm}:{ss}
      </span>
      <span className="mt-1 block text-sm text-muted">/ {total} giây</span>
    </ProgressRing>
  );
}
