"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveActiveHubSectionId } from "@/lib/styrkeoevelser-hub-active-section";
import {
  STYRKEOEVELSER_HUB_ALLE_ANCHOR_ID,
  STYRKEOEVELSER_HUB_BODY_SECTIONS,
} from "@/lib/styrkeoevelser-hub-sections";

/** Fallback if sticky bar hasn’t measured yet (header + chip row). */
const FALLBACK_STICKY_OFFSET_PX = 128;

/** Extra px so a section that just landed under the bar still counts as active. */
const ACTIVATION_SLACK_PX = 8;

/** Custom jump duration (native `behavior: "smooth"` is browser-defined and often feels slow). */
const JUMP_SCROLL_MS = 350;

const hubSectionIdsOrdered = [
  ...STYRKEOEVELSER_HUB_BODY_SECTIONS.map((s) => s.id),
  STYRKEOEVELSER_HUB_ALLE_ANCHOR_ID,
];

const stickyOffsetCssVar = "--styrke-hub-sticky-offset";

export const StyrkeoevelserHubJumpLinks = () => {
  const navRef = useRef<HTMLElement>(null);
  const pendingActiveIdRef = useRef<string | null>(null);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const measureStickyOffset = useCallback(() => {
    const bottom = navRef.current?.getBoundingClientRect().bottom;
    const offset =
      typeof bottom === "number" && bottom > 0
        ? Math.ceil(bottom)
        : FALLBACK_STICKY_OFFSET_PX;
    document.documentElement.style.setProperty(
      stickyOffsetCssVar,
      `${offset}px`
    );
    return offset;
  }, []);

  const updateActive = useCallback(() => {
    if (pendingActiveIdRef.current) {
      setActiveId(pendingActiveIdRef.current);
      return;
    }

    const line = measureStickyOffset() + ACTIVATION_SLACK_PX;
    const sections = hubSectionIdsOrdered.flatMap((id) => {
      const el = document.getElementById(id);
      if (!el) {
        return [];
      }
      return [{ id, top: el.getBoundingClientRect().top }];
    });
    setActiveId(resolveActiveHubSectionId(sections, line));
  }, [measureStickyOffset]);

  useEffect(() => {
    measureStickyOffset();

    const hashId = window.location.hash.replace(/^#/, "");
    if (hashId && hubSectionIdsOrdered.includes(hashId)) {
      setActiveId(hashId);
    } else {
      updateActive();
    }

    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive, { passive: true });
    window.addEventListener("hashchange", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      window.removeEventListener("hashchange", updateActive);
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
      }
      document.documentElement.style.removeProperty(stickyOffsetCssVar);
    };
  }, [measureStickyOffset, updateActive]);

  const scrollToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) {
        return;
      }

      const offset = measureStickyOffset();
      const targetTop = Math.max(
        0,
        window.scrollY + el.getBoundingClientRect().top - offset
      );
      const startTop = window.scrollY;
      const distance = targetTop - startTop;

      pendingActiveIdRef.current = id;
      setActiveId(id);

      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
      }
      // Keep the clicked chip selected while the short jump settles.
      unlockTimerRef.current = setTimeout(() => {
        pendingActiveIdRef.current = null;
        updateActive();
      }, JUMP_SCROLL_MS + 50);

      if (Math.abs(distance) < 2) {
        history.replaceState(null, "", `#${id}`);
        return;
      }

      const startTime = performance.now();
      const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / JUMP_SCROLL_MS);
        window.scrollTo({ top: startTop + distance * easeOutCubic(progress) });
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
      history.replaceState(null, "", `#${id}`);
    },
    [measureStickyOffset, updateActive]
  );

  const chipClass = (id: string) => {
    const isActive = activeId === id;
    return [
      "inline-flex rounded-full border px-3 py-1.5 text-sm shadow-sm transition-colors",
      isActive
        ? "border-brand-primary bg-brand-primary font-semibold text-white"
        : "border-gray-200 bg-white font-normal text-gray-900 hover:border-gray-300 hover:bg-gray-50",
    ].join(" ");
  };

  return (
    <nav
      ref={navRef}
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
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(chip.id);
              }}
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
