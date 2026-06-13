"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  STYRKEOEVELSER_HUB_ALLE_ANCHOR_ID,
  STYRKEOEVELSER_HUB_BODY_SECTIONS,
} from "@/lib/styrkeoevelser-hub-sections";

/** Viewport offset from top (sticky header sm:h-16 + sticky bar row). */
const ACTIVATION_OFFSET_PX = 120;

const hubSectionIdsOrdered = [
  ...STYRKEOEVELSER_HUB_BODY_SECTIONS.map((s) => s.id),
  STYRKEOEVELSER_HUB_ALLE_ANCHOR_ID,
];

export const StyrkeoevelserHubJumpLinks = () => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const chips = useMemo(
    () => [
      ...STYRKEOEVELSER_HUB_BODY_SECTIONS.map((sec) => ({
        id: sec.id,
        label: sec.jumpLabel,
      })),
      {
        id: STYRKEOEVELSER_HUB_ALLE_ANCHOR_ID,
        label: "Alle",
      },
    ],
    []
  );

  const updateActive = useCallback(() => {
    const line = ACTIVATION_OFFSET_PX;
    let current: string | null = null;
    for (const id of hubSectionIdsOrdered) {
      const el = document.getElementById(id);
      if (!el) {
        continue;
      }
      if (el.getBoundingClientRect().top <= line) {
        current = id;
      }
    }
    setActiveId(current);
  }, []);

  useEffect(() => {
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive, { passive: true });
    window.addEventListener("hashchange", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      window.removeEventListener("hashchange", updateActive);
    };
  }, [updateActive]);

  const chipClass = (id: string) => {
    const isActive = activeId === id;
    return [
      "inline-flex rounded-full border px-3 py-1.5 text-sm shadow-sm transition-colors",
      isActive
        ? "border-gray-800 bg-gray-100 font-medium text-gray-900"
        : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50",
    ].join(" ");
  };

  return (
    <nav
      className="sticky top-14 z-40 -mx-4 mb-8 border-b border-gray-200/90 bg-gray-50/95 px-4 py-3 backdrop-blur-sm sm:top-16"
      aria-label="Hop til kropsdel"
    >
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.id}>
            <Link
              href={`#${chip.id}`}
              className={chipClass(chip.id)}
              aria-current={activeId === chip.id ? "location" : undefined}
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
