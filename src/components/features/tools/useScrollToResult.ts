"use client";

import { useEffect, useRef } from "react";

/**
 * Ruller resultatkortet i syne, hver gang der beregnes et nyt resultat.
 * Giv elementet `scroll-mt-24`, så det ikke havner under headeren.
 */
export function useScrollToResult<T extends HTMLElement = HTMLDivElement>(
  result: unknown
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!result || !element) return;

    const { top } = element.getBoundingClientRect();
    if (top > 0 && top < window.innerHeight / 2) return;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    element.scrollIntoView?.({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [result]);

  return ref;
}
