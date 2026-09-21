/**
 * Structured opening hours — the shape stored in `clinics.opening_hours` (jsonb).
 *
 * A missing day key means "we don't know". An empty array means "closed that day".
 * Keeping those distinct is the whole point: conflating them is what made the Google
 * sync mark ~1,550 clinics closed all week.
 */

export const DAY_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export type DayKey = (typeof DAY_KEYS)[number];

/** `open`/`close` are ISO `HH:MM` in Europe/Copenhagen. `close` may be `"24:00"`. */
export type TimeRange = {
  open: string;
  close: string;
};

export type OpeningHours = Partial<Record<DayKey, TimeRange[]>>;

/** Legacy `mandag`..`søndag` text columns, in Monday-first order. */
export const LEGACY_DAY_COLUMNS = [
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
  "søndag",
] as const;

export type LegacyDayColumn = (typeof LEGACY_DAY_COLUMNS)[number];

export type LegacyOpeningHoursRow = Partial<
  Record<LegacyDayColumn, string | null>
>;

/** Monday-first, matching Danish convention and LEGACY_DAY_COLUMNS. */
export const DAY_KEY_TO_LEGACY_COLUMN: Record<DayKey, LegacyDayColumn> = {
  mon: "mandag",
  tue: "tirsdag",
  wed: "onsdag",
  thu: "torsdag",
  fri: "fredag",
  sat: "lørdag",
  sun: "søndag",
};

export const DAY_KEY_TO_SCHEMA_ORG_DAY: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const DAY_KEY_TO_DANISH_LABEL: Record<DayKey, string> = {
  mon: "Mandag",
  tue: "Tirsdag",
  wed: "Onsdag",
  thu: "Torsdag",
  fri: "Fredag",
  sat: "Lørdag",
  sun: "Søndag",
};

/** Shown for a day we know the clinic is closed. */
export const CLOSED_LABEL_DA = "Lukket";
