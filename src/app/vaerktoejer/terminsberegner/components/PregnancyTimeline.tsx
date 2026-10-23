import {
  Baby,
  CalendarCheck,
  CalendarClock,
  Check,
  LucideIcon,
  ScanLine,
} from "lucide-react";
import {
  addDays,
  daysBetween,
  formatDanishDate,
  formatDanishDateRange,
} from "@/lib/calculators/dates";
import {
  DueDateMilestone,
  DueDateMilestoneKind,
  DueDateSuccess,
  formatGestationalAge,
} from "@/lib/calculators/due-date";
import { cn } from "@/lib/utils";

const TRIMESTER_DAYS = 14 * 7;

const TRIMESTERS = [
  { number: 1, weeks: "uge 0–13" },
  { number: 2, weeks: "uge 14–27" },
  { number: 3, weeks: "uge 28–42" },
] as const;

const MILESTONE_ICONS: Record<Exclude<DueDateMilestoneKind, "trimester">, LucideIcon> = {
  scan: ScanLine,
  fullTerm: CalendarCheck,
  dueDate: Baby,
  termEnd: CalendarClock,
};

function clampFraction(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function describeTimeUntil(days: number): string {
  if (days === 1) return "i morgen";
  if (days < 14) return `om ${days} dage`;
  return `om ${Math.round(days / 7)} uger`;
}

function formatMilestoneDate(milestone: DueDateMilestone): string {
  return milestone.end
    ? formatDanishDateRange(milestone.start, milestone.end)
    : formatDanishDate(milestone.start);
}

export function TrimesterProgress({ result }: { result: DueDateSuccess }) {
  return (
    <div
      role="progressbar"
      aria-label="Hvor langt du er i graviditeten"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={result.progressPct}
      aria-valuetext={`Uge ${result.gestationalWeeks}+${result.gestationalDays}, ${result.trimester}. trimester`}
    >
      <div className="flex gap-1">
        {TRIMESTERS.map(({ number }) => {
          const fraction = clampFraction(
            (result.elapsedDays - (number - 1) * TRIMESTER_DAYS) / TRIMESTER_DAYS
          );
          const isCurrent = number === result.trimester;
          return (
            <div key={number} className="relative flex-1">
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-brand-primary"
                  style={{ width: `${fraction * 100}%` }}
                />
              </div>
              {isCurrent && (
                <span
                  aria-hidden
                  className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-primary shadow"
                  style={{ left: `${fraction * 100}%` }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1" aria-hidden>
        {TRIMESTERS.map(({ number, weeks }) => (
          <div
            key={number}
            className={cn(
              "flex-1 text-xs",
              number === result.trimester
                ? "font-semibold text-gray-900"
                : "text-gray-500"
            )}
          >
            {number}. trimester
            <span className="block font-normal text-gray-400">{weeks}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type TimelineRow =
  | {
      type: "trimester";
      number: number;
      start: Date;
      weeksLabel: string;
      reached: boolean;
    }
  | { type: "milestone"; milestone: DueDateMilestone; reached: boolean }
  | { type: "today"; reached: true };

function buildRows(result: DueDateSuccess): TimelineRow[] {
  const rows: TimelineRow[] = [
    {
      type: "trimester",
      number: 1,
      start: result.gestationStart,
      weeksLabel: formatGestationalAge(0),
      reached: result.status !== "planned",
    },
  ];

  let trimesterNumber = 1;
  for (const milestone of result.milestones) {
    const reached = milestone.isPassed || milestone.isCurrent;
    if (milestone.kind === "trimester") {
      trimesterNumber += 1;
      rows.push({
        type: "trimester",
        number: trimesterNumber,
        start: milestone.start,
        weeksLabel: milestone.weeksLabel,
        reached,
      });
    } else {
      rows.push({ type: "milestone", milestone, reached });
    }
  }

  const hasCurrentMilestone = result.milestones.some(
    (milestone) => milestone.isCurrent && milestone.kind !== "trimester"
  );
  if (result.status === "ongoing" && !hasCurrentMilestone) {
    const firstUpcoming = rows.findIndex((row) => !row.reached);
    rows.splice(firstUpcoming === -1 ? rows.length : firstUpcoming, 0, {
      type: "today",
      reached: true,
    });
  }

  return rows;
}

function Node({ row }: { row: TimelineRow }) {
  if (row.type === "today") {
    return (
      <span className="flex size-8 items-center justify-center">
        <span className="size-3 rounded-full bg-gray-900 ring-4 ring-gray-900/15" />
      </span>
    );
  }

  if (row.type === "trimester") {
    return (
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
          row.reached
            ? "bg-gray-900 text-white"
            : "border-2 border-gray-200 bg-white text-gray-500"
        )}
      >
        {row.number}
      </span>
    );
  }

  const { milestone } = row;
  const Icon =
    milestone.isPassed
      ? Check
      : MILESTONE_ICONS[milestone.kind as Exclude<DueDateMilestoneKind, "trimester">];
  return (
    <span
      className={cn(
        "flex size-8 items-center justify-center rounded-full",
        milestone.kind === "dueDate" && !milestone.isPassed
          ? "bg-gray-900 text-white"
          : row.reached
            ? "bg-gray-100 text-gray-700"
            : "border border-gray-200 bg-white text-gray-400"
      )}
    >
      <Icon className="size-4" aria-hidden />
    </span>
  );
}

function RowContent({
  row,
  result,
  today,
}: {
  row: TimelineRow;
  result: DueDateSuccess;
  today: Date;
}) {
  if (row.type === "today") {
    return (
      <span className="inline-flex rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white tabular-nums">
        I dag · uge {result.gestationalWeeks}+{result.gestationalDays}
      </span>
    );
  }

  if (row.type === "trimester") {
    return (
      <>
        <p
          className={cn(
            "text-base font-semibold",
            row.reached ? "text-gray-900" : "text-gray-600"
          )}
        >
          {row.number}. trimester
        </p>
        <p className="text-sm text-gray-500 tabular-nums">
          {row.number === 1 ? "Fra" : "Begynder"} {formatDanishDate(row.start)}{" "}
          <span className="text-gray-400">· uge {row.weeksLabel}</span>
        </p>
      </>
    );
  }

  const { milestone } = row;
  const daysUntil = daysBetween(today, milestone.start);
  return (
    <div
      className={cn(
        milestone.kind === "dueDate" &&
          "-my-2 -ml-3 rounded-xl bg-brand-beige px-3 py-2"
      )}
    >
      <p
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm",
          milestone.kind === "dueDate" ? "font-semibold" : "font-medium",
          milestone.isPassed ? "text-gray-500" : "text-gray-900"
        )}
      >
        {milestone.label}
        {milestone.isPassed && <span className="sr-only">(passeret)</span>}
        {milestone.isCurrent && (
          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white">
            {milestone.end ? "Nu" : "I dag"}
          </span>
        )}
      </p>
      <p className="text-sm text-gray-600 tabular-nums">
        {formatMilestoneDate(milestone)}{" "}
        <span className="text-gray-400">· uge {milestone.weeksLabel}</span>
        {!milestone.isPassed && !milestone.isCurrent && (
          <span className="text-gray-400"> · {describeTimeUntil(daysUntil)}</span>
        )}
      </p>
    </div>
  );
}

export function PregnancyTimeline({ result }: { result: DueDateSuccess }) {
  const rows = buildRows(result);
  const today = addDays(result.gestationStart, result.elapsedDays);

  return (
    <ol>
      {rows.map((row, index) => {
        const isFirst = index === 0;
        const isLast = index === rows.length - 1;
        const nextReached = rows[index + 1]?.reached ?? false;
        return (
          <li
            key={row.type === "milestone" ? row.milestone.label : `${row.type}-${index}`}
            className="flex gap-3"
            aria-current={row.type === "today" ? "date" : undefined}
          >
            <div className="flex w-8 flex-none flex-col items-center">
              <span
                className={cn(
                  "h-2 w-0.5",
                  isFirst ? "bg-transparent" : row.reached ? "bg-gray-400" : "bg-gray-200"
                )}
              />
              <span aria-hidden>
                <Node row={row} />
              </span>
              <span
                className={cn(
                  "min-h-3 w-0.5 flex-1",
                  isLast ? "bg-transparent" : nextReached ? "bg-gray-400" : "bg-gray-200"
                )}
              />
            </div>
            <div
              className={cn(
                "min-w-0 flex-1",
                row.type === "today" ? "pb-4 pt-3" : "pb-5 pt-2.5",
                isLast && "pb-0"
              )}
            >
              <RowContent row={row} result={result} today={today} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
