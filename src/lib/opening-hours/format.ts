/**
 * Rendering and interop for structured opening hours: Danish display strings, the legacy
 * `mandag`..`søndag` text columns we still dual-write, and schema.org output.
 */

import { parseOpeningHoursDayText } from "./from-google";
import {
  CLOSED_LABEL_DA,
  DAY_KEYS,
  DAY_KEY_TO_DANISH_LABEL,
  DAY_KEY_TO_LEGACY_COLUMN,
  DAY_KEY_TO_SCHEMA_ORG_DAY,
  type DayKey,
  type LegacyDayColumn,
  type LegacyOpeningHoursRow,
  type OpeningHours,
  type TimeRange,
} from "./types";

const ALL_DAY_LABEL_DA = "Åbent 24 timer";

const isAllDay = (ranges: TimeRange[]): boolean =>
  ranges.length === 1 &&
  ranges[0].open === "00:00" &&
  (ranges[0].close === "24:00" || ranges[0].close === "00:00");

/** Danish typography: "08.00–18.00" (periods, en-dash) — the same form Google returns for `da`. */
const formatRangeDa = (range: TimeRange): string =>
  `${range.open.replace(":", ".")}–${range.close.replace(":", ".")}`;

/**
 * One day as display text, or null when we have no data for that day.
 * Distinct from `CLOSED_LABEL_DA`, which means we know it is closed.
 */
export const formatDayDa = (ranges: TimeRange[] | undefined): string | null => {
  if (ranges === undefined) return null;
  if (ranges.length === 0) return CLOSED_LABEL_DA;
  if (isAllDay(ranges)) return ALL_DAY_LABEL_DA;
  return ranges.map(formatRangeDa).join(", ");
};

export type OpeningHoursDisplayRow = {
  day: DayKey;
  label: string;
  hours: string | null;
};

/** Monday-first rows ready for rendering. */
export const formatOpeningHoursDa = (
  hours: OpeningHours | null | undefined
): OpeningHoursDisplayRow[] =>
  DAY_KEYS.map((day) => ({
    day,
    label: DAY_KEY_TO_DANISH_LABEL[day],
    hours: formatDayDa(hours?.[day]),
  }));

export const hasAnyKnownOpeningHours = (
  hours: OpeningHours | null | undefined
): boolean => Boolean(hours && DAY_KEYS.some((day) => hours[day] !== undefined));

/** True when every known day is closed — usually a sign of a bad import rather than reality. */
export const isClosedAllWeek = (
  hours: OpeningHours | null | undefined
): boolean => {
  if (!hasAnyKnownOpeningHours(hours)) return false;
  return DAY_KEYS.every((day) => (hours?.[day]?.length ?? 0) === 0);
};

/** Dual-write payload for the legacy text columns. `null` clears a day we have no data for. */
export const openingHoursToLegacyColumns = (
  hours: OpeningHours | null | undefined
): Record<LegacyDayColumn, string | null> =>
  Object.fromEntries(
    DAY_KEYS.map((day) => [
      DAY_KEY_TO_LEGACY_COLUMN[day],
      formatDayDa(hours?.[day]),
    ])
  ) as Record<LegacyDayColumn, string | null>;

/**
 * Read path for clinics not yet migrated to `opening_hours`. Parses whichever of the four
 * historical text formats the row happens to use.
 */
export const legacyColumnsToOpeningHours = (
  row: LegacyOpeningHoursRow | null | undefined
): OpeningHours | null => {
  if (!row) return null;

  const hours: OpeningHours = {};
  let sawAny = false;

  for (const day of DAY_KEYS) {
    const ranges = parseOpeningHoursDayText(row[DAY_KEY_TO_LEGACY_COLUMN[day]]);
    if (ranges === null) continue;
    hours[day] = ranges;
    sawAny = true;
  }

  return sawAny ? hours : null;
};

export type SchemaOpeningHoursSpecification = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string;
  opens: string;
  closes: string;
};

/** schema.org wants ISO times and has no 24:00, so end-of-day becomes 23:59. */
const toSchemaTime = (time: string): string =>
  time === "24:00" ? "23:59" : time;

/**
 * Only emits days the clinic is actually open. Closed and unknown days are omitted —
 * previously every day was emitted, including ones where `opens` was the string "Lukket".
 */
export const openingHoursToSchemaOrg = (
  hours: OpeningHours | null | undefined
): SchemaOpeningHoursSpecification[] => {
  if (!hours) return [];

  const specs: SchemaOpeningHoursSpecification[] = [];

  for (const day of DAY_KEYS) {
    for (const range of hours[day] ?? []) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_KEY_TO_SCHEMA_ORG_DAY[day],
        opens: toSchemaTime(range.open),
        closes: toSchemaTime(range.close),
      });
    }
  }

  return specs;
};

/**
 * Resolves the hours to show for a clinic: structured column first, legacy text columns
 * as a fallback while the backfill is still in progress.
 */
export const resolveClinicOpeningHours = (
  clinic:
    | (LegacyOpeningHoursRow & { opening_hours?: OpeningHours | null })
    | null
    | undefined
): OpeningHours | null => {
  if (!clinic) return null;
  if (hasAnyKnownOpeningHours(clinic.opening_hours)) {
    return clinic.opening_hours ?? null;
  }
  return legacyColumnsToOpeningHours(clinic);
};
