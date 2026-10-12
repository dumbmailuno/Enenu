"use client";

import { useEffect } from "react";

export const VISIT_KEY = "jade-visited";

export function readVisited(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(VISIT_KEY) ?? "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch { return []; }
}

/** Put one on a page. It remembers, on this device only, that she has been here. The hub reads it. */
export function Visit({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const seen = new Set(readVisited());
      if (!seen.has(slug)) { seen.add(slug); localStorage.setItem(VISIT_KEY, JSON.stringify([...seen])); }
    } catch { /* storage unavailable */ }
  }, [slug]);
  return null;
}
