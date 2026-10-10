// Updated: 2026-10-10 - Accepts children rendered below the month list (used for the "add your course" card).
"use client";

import { ReactNode, RefObject, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TimelineMonth {
  id: string;
  yearMonth: string;
  label: string;
  shortLabel: string;
  count: number;
}

interface CourseMonthTimelineProps {
  months: TimelineMonth[];
  agendaRef: RefObject<HTMLElement | null>;
  onSelectMonth: (id: string) => void;
  children?: ReactNode;
}

// Sticky site header (64px), condensed search bar (56px) and sticky month heading.
const READING_LINE_PX = 170;

export function CourseMonthTimeline({
  months,
  agendaRef,
  onSelectMonth,
  children,
}: CourseMonthTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAgendaInView, setIsAgendaInView] = useState(true);

  useEffect(() => {
    const agenda = agendaRef.current;
    if (!agenda) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsAgendaInView(entry.isIntersecting),
    );
    observer.observe(agenda);
    return () => observer.disconnect();
  }, [agendaRef]);

  useEffect(() => {
    let frame = 0;

    function updateActiveMonth() {
      frame = 0;
      let next = 0;
      months.forEach((month, index) => {
        const top = document
          .getElementById(month.id)
          ?.getBoundingClientRect().top;
        if (top !== undefined && top <= READING_LINE_PX) next = index;
      });
      setActiveIndex(next);
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(updateActiveMonth);
    }

    updateActiveMonth();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [months]);

  if (months.length === 0) return null;

  const activeId = months[Math.min(activeIndex, months.length - 1)].id;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-40 z-30 hidden transition-opacity duration-300 motion-reduce:transition-none xl:block",
        isAgendaInView ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Mirrors the site header container so the list's right edge lines up with "Log ind". */}
      <div className="mx-auto flex max-w-[1440px] justify-end px-5 sm:px-6 lg:px-8">
        <div className={cn("w-32", isAgendaInView && "pointer-events-auto")}>
          <nav aria-label="Måneder">
            <ol className="space-y-0.5">
              {months.map((month) => {
                const isActive = month.id === activeId;
                return (
                  <li key={month.id}>
                    <button
                      type="button"
                      onClick={() => onSelectMonth(month.id)}
                      aria-label={`${month.label}, ${month.count} ${month.count === 1 ? "kursus" : "kurser"}`}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-full px-3 py-1 text-xs transition-colors",
                        isActive
                          ? "bg-brand-primary/10 font-semibold text-brand-primary"
                          : "text-gray-500 hover:bg-brand-primary/5 hover:text-brand-primary",
                      )}
                    >
                      <span>
                        {month.shortLabel} {month.yearMonth.slice(0, 4)}
                      </span>
                      <span
                        className={cn(
                          "tabular-nums",
                          isActive ? "text-brand-primary" : "text-gray-400",
                        )}
                      >
                        {month.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
