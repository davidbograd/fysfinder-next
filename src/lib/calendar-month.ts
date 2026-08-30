/**
 * Calendar-month bounds in Europe/Copenhagen for monthly clinic summary emails.
 * Updated: title-case month helper for email subject lines.
 */

const COPENHAGEN_TZ = "Europe/Copenhagen";

const DANISH_MONTH_NAMES = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
] as const;

export interface CalendarMonthBounds {
  startIso: string;
  endIso: string;
  periodYm: string;
  year: number;
  month: number;
  monthLabelDa: string;
}

function getPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): number {
  return Number(parts.find((part) => part.type === type)?.value);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const asUtc = Date.UTC(
    getPart(parts, "year"),
    getPart(parts, "month") - 1,
    getPart(parts, "day"),
    getPart(parts, "hour"),
    getPart(parts, "minute"),
    getPart(parts, "second")
  );

  return asUtc - date.getTime();
}

export function copenhagenDateToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0
): Date {
  const utcGuess = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, ms)
  );
  const offset = getTimeZoneOffsetMs(utcGuess, COPENHAGEN_TZ);
  const adjusted = new Date(utcGuess.getTime() - offset);
  const offsetAfterAdjust = getTimeZoneOffsetMs(adjusted, COPENHAGEN_TZ);
  if (offsetAfterAdjust !== offset) {
    return new Date(utcGuess.getTime() - offsetAfterAdjust);
  }
  return adjusted;
}

export function getCopenhagenDateParts(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: COPENHAGEN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: getPart(parts, "year"),
    month: getPart(parts, "month"),
    day: getPart(parts, "day"),
  };
}

export function titleCaseDanishMonth(monthLabelDa: string): string {
  const trimmed = monthLabelDa.trim();
  if (!trimmed) {
    return trimmed;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function parsePeriodYm(periodYm: string): { year: number; month: number } {
  const match = /^(\d{4})-(\d{2})$/.exec(periodYm.trim());
  if (!match) {
    throw new Error(`Ugyldig periode: ${periodYm}. Brug YYYY-MM.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    throw new Error(`Ugyldig måned: ${periodYm}`);
  }

  return { year, month };
}

export function getCalendarMonthBounds(
  year: number,
  month: number
): CalendarMonthBounds {
  const start = copenhagenDateToUtc(year, month, 1, 0, 0, 0, 0);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextStart = copenhagenDateToUtc(nextYear, nextMonth, 1, 0, 0, 0, 0);
  const end = new Date(nextStart.getTime() - 1);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    periodYm: `${year}-${String(month).padStart(2, "0")}`,
    year,
    month,
    monthLabelDa: DANISH_MONTH_NAMES[month - 1],
  };
}

export function getPreviousCalendarMonthBounds(
  now: Date = new Date()
): CalendarMonthBounds {
  const { year, month } = getCopenhagenDateParts(now);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return getCalendarMonthBounds(prevYear, prevMonth);
}

export function wasOwnedDuringPeriod(
  ownedAtIso: string,
  periodEndIso: string
): boolean {
  return new Date(ownedAtIso).getTime() <= new Date(periodEndIso).getTime();
}
