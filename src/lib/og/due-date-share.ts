// Delbart billede af terminen fra terminsberegneren.
//
// URL'en indeholder kun terminsdatoen og hvor mange dage graviditeten er
// gået – ingen menstruations- eller undfangelsesdato, og intet om personen.

import { parseIsoDate, toIsoDate } from "@/lib/calculators/dates";
import {
  DueDateSuccess,
  PREGNANCY_LENGTH_DAYS,
  trimesterFor,
} from "@/lib/calculators/due-date";

export const DUE_DATE_SHARE_PATH = "/api/og/termin";

/** 41+6 – derefter er der ikke en igangværende graviditet at vise. */
const MAX_ELAPSED_DAYS = 41 * 7 + 6;
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

export interface DueDateShareContent {
  dueDate: Date;
  /** Kun når graviditeten er i gang. */
  progress: {
    elapsedDays: number;
    weeks: number;
    days: number;
    currentWeek: number;
    trimester: 1 | 2 | 3;
    progressPct: number;
  } | null;
}

/** Kun planlagte og igangværende graviditeter kan deles. */
export function canShareDueDate(result: DueDateSuccess): boolean {
  return result.status !== "ended";
}

export function buildDueDateShareUrl(result: DueDateSuccess): string {
  const params = new URLSearchParams({ termin: toIsoDate(result.dueDate) });
  if (result.status === "ongoing") {
    params.set("dag", String(result.elapsedDays));
  }
  return `${DUE_DATE_SHARE_PATH}?${params.toString()}`;
}

export function parseDueDateShareParams(
  searchParams: URLSearchParams
): DueDateShareContent | null {
  const dueDate = parseIsoDate(searchParams.get("termin") ?? "");
  if (
    !dueDate ||
    dueDate.getUTCFullYear() < MIN_YEAR ||
    dueDate.getUTCFullYear() > MAX_YEAR
  ) {
    return null;
  }

  const rawDay = searchParams.get("dag");
  if (rawDay === null) {
    return { dueDate, progress: null };
  }
  if (!/^\d{1,3}$/.test(rawDay)) return null;
  const elapsedDays = Number(rawDay);
  if (elapsedDays > MAX_ELAPSED_DAYS) return null;

  return {
    dueDate,
    progress: {
      elapsedDays,
      weeks: Math.floor(elapsedDays / 7),
      days: elapsedDays % 7,
      currentWeek: Math.floor(elapsedDays / 7) + 1,
      trimester: trimesterFor(elapsedDays),
      progressPct: Math.min(100, Math.round((elapsedDays / PREGNANCY_LENGTH_DAYS) * 100)),
    },
  };
}
