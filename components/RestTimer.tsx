"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts down against a wall-clock deadline: background tabs throttle intervals,
 * so accumulating ticks would drift badly over a 90s rest.
 */
export function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  // Held in a ref: an inline onDone would otherwise change identity and restart the timer.
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const deadline = Date.now() + seconds * 1000;
    const id = setInterval(() => {
      const remaining = Math.ceil((deadline - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(id);
        setLeft(0);
        navigator.vibrate?.(200);
        done.current();
      } else {
        setLeft(remaining);
      }
    }, 250);
    return () => clearInterval(id);
  }, [seconds]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <span className="font-mono text-6xl font-semibold tabular-nums">
      {mm}:{ss}
    </span>
  );
}
