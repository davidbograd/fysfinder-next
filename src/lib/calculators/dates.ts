// Datoer i termins- og ægløsningsberegneren regnes som rene kalenderdage i UTC,
// så skift til og fra sommertid aldrig flytter en termin en dag.

const MS_PER_DAY = 86_400_000;

const MONTHS = [
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
];

const WEEKDAYS = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
];

/** "2026-10-19" (som et datofelt leverer den) -> midnat UTC, eller null. */
export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Afviser datoer som 2026-02-31, som Date ellers ruller videre til marts.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Dagens dato i visitorens egen tidszone, som datofelterne også bruger. */
export function todayIsoDate(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Hele dage fra `from` til `to`; negativ, når `to` ligger før. */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** "8. januar 2027" */
export function formatDanishDate(date: Date): string {
  return `${date.getUTCDate()}. ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "8. januar" */
export function formatDanishDayMonth(date: Date): string {
  return `${date.getUTCDate()}. ${MONTHS[date.getUTCMonth()]}`;
}

/** "fredag" */
export function formatDanishWeekday(date: Date): string {
  return WEEKDAYS[date.getUTCDay()];
}

export function formatDanishMonthYear(date: Date): string {
  const month = MONTHS[date.getUTCMonth()];
  return `${month[0].toUpperCase()}${month.slice(1)} ${date.getUTCFullYear()}`;
}

/** "9.–14. november", "28. oktober – 2. november" eller med år, når de er forskellige. */
export function formatDanishDateRange(start: Date, end: Date): string {
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  if (!sameYear) {
    return `${formatDanishDate(start)} – ${formatDanishDate(end)}`;
  }
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${start.getUTCDate()}.–${formatDanishDayMonth(end)}`;
  }
  return `${formatDanishDayMonth(start)} – ${formatDanishDayMonth(end)}`;
}
