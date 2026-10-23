import {
  addDays,
  daysBetween,
  formatDanishDayMonth,
  formatDanishMonthYear,
  toIsoDate,
} from "@/lib/calculators/dates";
import type { OvulationCycle } from "@/lib/calculators/ovulation";
import { cn } from "@/lib/utils";

type DayKind =
  | "lastPeriod"
  | "period"
  | "fertile"
  | "peak"
  | "ovulation"
  | "afterOvulation"
  | null;

const WEEKDAY_HEADERS = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

const DAY_LABELS: Record<Exclude<DayKind, null>, string> = {
  lastPeriod: "din seneste menstruation",
  period: "forventet menstruation",
  fertile: "frugtbar dag",
  peak: "mest frugtbare dag",
  ovulation: "forventet ægløsning",
  afterOvulation: "dagen efter ægløsning",
};

/** Menstruationen regnes som 5 dage: første blødningsdag og de 4 næste. */
const PERIOD_DAYS = 5;

/** Svagere og svagere rød, så blødningen ser ud til at klinge af. */
const PERIOD_FADE = [
  "bg-rose-100 font-semibold text-rose-700",
  "bg-rose-100/75 text-rose-700",
  "bg-rose-100/55 text-rose-600",
  "bg-rose-100/35 text-rose-600",
  "bg-rose-100/20 text-rose-500",
];

/**
 * Cyklussens egen menstruation er den indtastede, medmindre datoen lå så langt
 * tilbage, at beregningen er rullet videre – så er den også forventet.
 */
function currentPeriodKind(cycle: OvulationCycle, lastPeriodStart: Date): DayKind {
  return cycle.periodStart.getTime() === lastPeriodStart.getTime()
    ? "lastPeriod"
    : "period";
}

function kindOf(date: Date, cycle: OvulationCycle, lastPeriodStart: Date): DayKind {
  const time = date.getTime();
  if (time === cycle.periodStart.getTime()) {
    return currentPeriodKind(cycle, lastPeriodStart);
  }
  if (time === cycle.ovulation.getTime()) return "ovulation";
  if (time === addDays(cycle.ovulation, 1).getTime()) return "afterOvulation";
  if (time >= cycle.peakStart.getTime() && time < cycle.ovulation.getTime()) {
    return "peak";
  }
  if (time >= cycle.fertileStart.getTime() && time < cycle.peakStart.getTime()) {
    return "fertile";
  }
  if (periodDayIndex(date, cycle.nextPeriod) !== null) return "period";
  if (periodDayIndex(date, cycle.periodStart) !== null) {
    return currentPeriodKind(cycle, lastPeriodStart);
  }
  return null;
}

function fadeIndex(date: Date, cycle: OvulationCycle): number {
  return (
    periodDayIndex(date, cycle.nextPeriod) ??
    periodDayIndex(date, cycle.periodStart) ??
    0
  );
}

/** 0 på første blødningsdag, 4 på den sidste; null uden for menstruationen. */
function periodDayIndex(date: Date, periodStart: Date): number | null {
  const index = daysBetween(periodStart, date);
  return index >= 0 && index < PERIOD_DAYS ? index : null;
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/** Alle måneder fra cyklussens menstruation til slutningen af den næste. */
function monthStarts(cycle: OvulationCycle): Date[] {
  const months: Date[] = [];
  const last = startOfMonth(addDays(cycle.nextPeriod, PERIOD_DAYS - 1));
  for (
    let month = startOfMonth(cycle.periodStart);
    month.getTime() <= last.getTime();
    month = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1))
  ) {
    months.push(month);
  }
  return months;
}

function MonthGrid({
  monthStart,
  cycle,
  lastPeriodStart,
}: {
  monthStart: Date;
  cycle: OvulationCycle;
  lastPeriodStart: Date;
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
          const kind = kindOf(day, cycle, lastPeriodStart);
          const isSelected = day.getTime() === lastPeriodStart.getTime();
          return (
            <span
              key={toIsoDate(day)}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-full tabular-nums",
                kind === null && "text-gray-700",
                kind === "fertile" && "bg-brand-primary/15 text-gray-900",
                kind === "peak" && "bg-brand-primary/30 font-semibold text-gray-900",
                kind === "ovulation" && "bg-brand-primary font-semibold text-white",
                kind === "afterOvulation" &&
                  "bg-brand-primary/15 font-semibold text-gray-900 ring-2 ring-inset ring-brand-primary/60",
                (kind === "period" || kind === "lastPeriod") &&
                  PERIOD_FADE[fadeIndex(day, cycle)],
                isSelected && "ring-2 ring-inset ring-rose-500"
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
  { kind: "period", label: "Menstruation", className: "bg-rose-100" },
  { kind: "fertile", label: "Frugtbar", className: "bg-brand-primary/15 ring-1 ring-inset ring-brand-primary/25" },
  { kind: "peak", label: "Mest frugtbar", className: "bg-brand-primary/30" },
  { kind: "ovulation", label: "Ægløsning", className: "bg-brand-primary" },
  {
    kind: "afterOvulation",
    label: "Dagen efter ægløsning",
    className: "bg-brand-primary/15 ring-2 ring-inset ring-brand-primary/60",
  },
];

export function CycleCalendar({
  cycle,
  lastPeriodStart,
}: {
  cycle: OvulationCycle;
  /** Den menstruation, brugeren har indtastet. */
  lastPeriodStart: Date;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-6 sm:grid-cols-2">
        {monthStarts(cycle).map((monthStart) => (
          <MonthGrid
            key={toIsoDate(monthStart)}
            monthStart={monthStart}
            cycle={cycle}
            lastPeriodStart={lastPeriodStart}
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
