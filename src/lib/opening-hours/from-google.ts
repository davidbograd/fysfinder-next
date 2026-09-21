/**
 * Converts Google Places `regularOpeningHours` into our structured shape.
 *
 * Prefers `periods`, which is numeric and language-independent. The previous
 * implementation parsed the localized `weekdayDescriptions` strings instead and matched
 * only Danish day names, so an English response (the API default when `languageCode` is
 * omitted) silently produced "closed" for every day.
 */

import {
  DAY_KEYS,
  type DayKey,
  type OpeningHours,
  type TimeRange,
} from "./types";

export type GooglePeriodPoint = {
  day?: number;
  hour?: number;
  minute?: number;
};

export type GooglePeriod = {
  open?: GooglePeriodPoint;
  close?: GooglePeriodPoint;
};

export type GoogleRegularOpeningHours = {
  periods?: GooglePeriod[];
  weekdayDescriptions?: string[];
};

/** Google numbers days 0=Sunday..6=Saturday; we key Monday-first. */
const GOOGLE_DAY_TO_KEY: Record<number, DayKey> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

const WEEKDAY_LABEL_TO_KEY: Record<string, DayKey> = {
  mandag: "mon",
  tirsdag: "tue",
  onsdag: "wed",
  torsdag: "thu",
  fredag: "fri",
  lørdag: "sat",
  lordag: "sat",
  søndag: "sun",
  sondag: "sun",
  monday: "mon",
  tuesday: "tue",
  wednesday: "wed",
  thursday: "thu",
  friday: "fri",
  saturday: "sat",
  sunday: "sun",
};

const CLOSED_TOKENS = ["lukket", "closed"];
const ALL_DAY_TOKENS = ["åbent 24 timer", "open 24 hours", "åbent døgnet rundt"];

const pad = (n: number): string => String(n).padStart(2, "0");

const toTime = (point: GooglePeriodPoint | undefined): string | null => {
  if (!point) return null;
  const hour = point.hour ?? 0;
  const minute = point.minute ?? 0;
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return `${pad(hour)}:${pad(minute)}`;
};

const emptyWeek = (): Record<DayKey, TimeRange[]> => ({
  mon: [],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [],
});

const openAllWeek = (): OpeningHours =>
  Object.fromEntries(
    DAY_KEYS.map((day) => [day, [{ open: "00:00", close: "24:00" }]])
  ) as OpeningHours;

/**
 * A single period that opens at Sunday 00:00 and never closes is Google's
 * representation of "open 24 hours, 7 days a week".
 */
const isAlwaysOpen = (periods: GooglePeriod[]): boolean =>
  periods.length === 1 &&
  periods[0].close === undefined &&
  periods[0].open?.day === 0 &&
  (periods[0].open?.hour ?? 0) === 0 &&
  (periods[0].open?.minute ?? 0) === 0;

const sortRanges = (ranges: TimeRange[]): TimeRange[] =>
  [...ranges].sort((a, b) => a.open.localeCompare(b.open));

const fromPeriods = (periods: GooglePeriod[]): OpeningHours | null => {
  if (isAlwaysOpen(periods)) return openAllWeek();

  const week = emptyWeek();
  let sawAny = false;

  for (const period of periods) {
    const dayNumber = period.open?.day;
    if (dayNumber === undefined) continue;

    const dayKey = GOOGLE_DAY_TO_KEY[dayNumber];
    if (!dayKey) continue;

    const open = toTime(period.open);
    if (!open) continue;

    // A period with no close point runs to the end of that day.
    const close = period.close ? toTime(period.close) : "24:00";
    if (!close) continue;

    week[dayKey].push({ open, close });
    sawAny = true;
  }

  if (!sawAny) return null;

  for (const day of DAY_KEYS) {
    week[day] = sortRanges(week[day]);
  }

  return week;
};

const normalizeLabel = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^[\d.\s•\-–—]+/, "");

/** Accepts "08.00", "08:00", "8.00", "8" and 12-hour forms like "7:00 AM". */
const parseClockToken = (raw: string): string | null => {
  const token = raw.trim().replace(/\u202f|\u00a0/g, " ");
  const match = token.match(/^(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3]?.toLowerCase();

  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;

  if (hour === 24 && minute === 0) return "24:00";
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return `${pad(hour)}:${pad(minute)}`;
};

/**
 * Parses one day's worth of display text, e.g. "08.00–18.00",
 * "08:00 – 12:00, 13:00 – 17:00", "7:00 AM – 9:00 PM", "Lukket".
 * Returns [] for an explicit closed marker and null when nothing is parseable.
 */
export const parseOpeningHoursDayText = (
  raw: string | null | undefined
): TimeRange[] | null => {
  if (!raw) return null;

  const text = raw.trim();
  if (!text) return null;

  const lowered = text.toLowerCase();
  if (CLOSED_TOKENS.some((token) => lowered === token)) return [];
  if (ALL_DAY_TOKENS.some((token) => lowered.includes(token))) {
    return [{ open: "00:00", close: "24:00" }];
  }

  const ranges: TimeRange[] = [];

  for (const segment of text.split(",")) {
    // Accept hyphen, en-dash, em-dash and "til" as range separators.
    const parts = segment.split(/\s*(?:[-–—]|\btil\b)\s*/i);
    if (parts.length !== 2) continue;

    const open = parseClockToken(parts[0]);
    const close = parseClockToken(parts[1]);
    if (!open || !close) continue;

    ranges.push({ open, close });
  }

  if (ranges.length === 0) return null;

  return sortRanges(ranges);
};

const fromWeekdayDescriptions = (
  descriptions: string[]
): OpeningHours | null => {
  const week: OpeningHours = {};
  let sawAny = false;

  for (const line of descriptions) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const dayKey = WEEKDAY_LABEL_TO_KEY[normalizeLabel(line.slice(0, colonIdx))];
    if (!dayKey) continue;

    const ranges = parseOpeningHoursDayText(line.slice(colonIdx + 1));
    if (ranges === null) continue;

    week[dayKey] = ranges;
    sawAny = true;
  }

  return sawAny ? week : null;
};

/**
 * Returns null when Google has no usable hours for the place, which must be treated as
 * "unknown" rather than "closed" — roughly half of our clinics are in that state.
 */
export const parseGoogleOpeningHours = (
  regularOpeningHours: GoogleRegularOpeningHours | undefined | null
): OpeningHours | null => {
  if (!regularOpeningHours) return null;

  const { periods, weekdayDescriptions } = regularOpeningHours;

  if (periods && periods.length > 0) {
    const fromStructured = fromPeriods(periods);
    if (fromStructured) return fromStructured;
  }

  if (weekdayDescriptions && weekdayDescriptions.length > 0) {
    return fromWeekdayDescriptions(weekdayDescriptions);
  }

  return null;
};
