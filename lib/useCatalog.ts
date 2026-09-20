"use client";

import { useEffect, useState } from "react";
import { loadCatalog, type Catalog } from "./exercises";

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
