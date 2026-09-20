"use client";

import { useEffect, useState } from "react";
import { loadCatalog, loadDetails, type Catalog } from "./exercises";
import type { Details } from "./types";

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadCatalog().then(
      (c) => alive && setCatalog(c),
      (e: Error) => alive && setError(e.message),
    );
    return () => {
      alive = false;
    };
  }, []);

  return { catalog, error, loading: !catalog && !error };
}

/** Pulls in the instruction bundle on demand; `null` until it lands. */
export function useDetails(id: string | undefined) {
  const [details, setDetails] = useState<Record<string, Details> | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    loadDetails().then(
      (d) => alive && setDetails(d),
      () => {}, // instructions are a nice-to-have; the rest of the screen still works
    );
    return () => {
      alive = false;
    };
  }, [id]);

  return id ? details?.[id] : undefined;
}
