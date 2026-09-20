"use client";

import { useSyncExternalStore } from "react";
import { todayKey, type WeekDay } from "./types";

const noop = () => () => {};

/** `null` on the server so the markup can't bake in the wrong day. */
export function useToday(): WeekDay | null {
  return useSyncExternalStore(noop, todayKey, () => null);
}
