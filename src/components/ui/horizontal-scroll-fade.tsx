// Horizontal overflow hint: edge gradients when content is scrollable (e.g. wide MDX tables).
"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SCROLL_EPS_PX = 2;

interface HorizontalScrollFadeProps {
  children: React.ReactNode;
  className?: string;
}

export const HorizontalScrollFade = ({
  children,
  className,
}: HorizontalScrollFadeProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(false);

  const syncFadeVisibility = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const canScrollX = scrollWidth - clientWidth > SCROLL_EPS_PX;

    if (!canScrollX) {
      setFadeLeft(false);
      setFadeRight(false);
      return;
    }

    setFadeLeft(scrollLeft > SCROLL_EPS_PX);
    setFadeRight(scrollLeft < scrollWidth - clientWidth - SCROLL_EPS_PX);
  }, []);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    let rafId = 0;
    const scheduleSync = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        syncFadeVisibility();
      });
    };

    scheduleSync();
    el.addEventListener("scroll", syncFadeVisibility, { passive: true });
    const ro = new ResizeObserver(scheduleSync);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("scroll", syncFadeVisibility);
      ro.disconnect();
    };
  }, [syncFadeVisibility]);

  return (
    <div className="relative w-full max-w-full">
      {fadeLeft ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-background to-transparent sm:w-12"
        />
      ) : null}
      {fadeRight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-background to-transparent sm:w-12"
        />
      ) : null}
      <div
        ref={scrollRef}
        className={cn(
          "w-full max-w-full overflow-x-auto [-webkit-overflow-scrolling:touch]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};
