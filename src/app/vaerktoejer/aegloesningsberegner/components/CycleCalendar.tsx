import {
  addDays,
  daysBetween,
  formatDanishDayMonth,
  formatDanishMonthYear,
  parseIsoDate,
  toIsoDate,
} from "@/lib/calculators/dates";
import type { OvulationCycle } from "@/lib/calculators/ovulation";
import { cn } from "@/lib/utils";

type DayKind = "period" | "fertile" | "peak" | "ovulation" | null;

const WEEKDAY_HEADERS = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

const DAY_LABELS: Record<Exclude<DayKind, null>, string> = {
  period: "forventet menstruation",
  fertile: "frugtbar dag",
  peak: "mest frugtbare dag",
  ovulation: "forventet ægløsning",
};

function kindOf(date: Date, cycle: OvulationCycle): DayKind {
  const time = date.getTime();
  if (time === cycle.ovulation.getTime()) return "ovulation";
  if (time >= cycle.peakStart.getTime() && time < cycle.ovulation.getTime()) {
    return "peak";
  }
  if (time >= cycle.fertileStart.getTime() && time < cycle.peakStart.getTime()) {
    return "fertile";
  }
  if (time === cycle.nextPeriod.getTime()) return "period";
  return null;
}

function monthStarts(cycle: OvulationCycle): Date[] {
  const first = new Date(
    Date.UTC(cycle.fertileStart.getUTCFullYear(), cycle.fertileStart.getUTCMonth(), 1)
  );
  const last = new Date(
    Date.UTC(cycle.nextPeriod.getUTCFullYear(), cycle.nextPeriod.getUTCMonth(), 1)
  );
  return first.getTime() === last.getTime() ? [first] : [first, last];
}

function MonthGrid({
  monthStart,
  cycle,
  today,
}: {
  monthStart: Date;
  cycle: OvulationCycle;
  today: Date | null;
}) {
  const nextMonth = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1)
  );
  const dayCount = daysBetween(monthStart, nextMonth);
  // Mandag først, som i en dansk kalender.
  const leadingBlanks = (monthStart.getUTCDay() + 6) % 7;
  const days = Array.from({ length: dayCount }, (_, index) =>
    addDays(monthStart, index)
  );

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-900">
        {formatDanishMonthYear(monthStart)}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAY_HEADERS.map((weekday) => (
          <span key={weekday} className="pb-1 font-medium text-gray-400">
            {weekday}
          </span>
        ))}
        {Array.from({ length: leadingBlanks }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {days.map((day) => {
          const kind = kindOf(day, cycle);
          const isToday = today !== null && day.getTime() === today.getTime();
          return (
            <span
              key={toIsoDate(day)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-full tabular-nums",
                kind === null && "text-gray-700",
                kind === "fertile" && "bg-brand-primary/15 text-brand-primary",
                kind === "peak" && "bg-brand-primary/40 font-semibold text-brand-primary",
                kind === "ovulation" && "bg-brand-primary font-semibold text-white",
                kind === "period" && "bg-rose-100 font-semibold text-rose-700",
                isToday && "ring-2 ring-gray-900 ring-offset-1"
              )}
            >
              {day.getUTCDate()}
              {kind && (
                <span className="sr-only">
                  {` ${formatDanishDayMonth(day)}: ${DAY_LABELS[kind]}`}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const LEGEND: { kind: Exclude<DayKind, null>; label: string; className: string }[] = [
  { kind: "fertile", label: "Frugtbar", className: "bg-brand-primary/15" },
  { kind: "peak", label: "Mest frugtbar", className: "bg-brand-primary/40" },
  { kind: "ovulation", label: "Ægløsning", className: "bg-brand-primary" },
  { kind: "period", label: "Næste menstruation", className: "bg-rose-100" },
];

export function CycleCalendar({
  cycle,
  today,
}: {
  cycle: OvulationCycle;
  /** ISO-dato for i dag, så dagen kan markeres. */
  today: string;
}) {
  const todayDate = parseIsoDate(today);
  return (
    <div className="space-y-4">
      <div className="grid gap-6 sm:grid-cols-2">
        {monthStarts(cycle).map((monthStart) => (
          <MonthGrid
            key={toIsoDate(monthStart)}
            monthStart={monthStart}
            cycle={cycle}
            today={todayDate}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
        {LEGEND.map((item) => (
          <li key={item.kind} className="flex items-center gap-1.5">
            <span aria-hidden className={cn("h-3 w-3 rounded-full", item.className)} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
