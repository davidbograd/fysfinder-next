// Fysfinder – terminsberegner
//
// Følger den danske guideline for terminsfastsættelse (DSOG, Sandbjerg 2009):
//   - Naegeles regel: termin = 280 dage efter sidste menstruations 1. dag,
//     korrigeret med det antal dage, cyklus afviger fra 28 dage.
//   - Kendt undfangelse, insemination (IUI) eller ægudtagning (IVF) sættes til
//     graviditetsuge 2+0, dvs. termin = datoen + 266 dage.
// Terminen fastsættes endeligt ved nakkefoldsscanningen; beregningen her er et
// estimat indtil da.

import { parseDecimal } from "./parse";
import { addDays, daysBetween, parseIsoDate } from "./dates";

export type DueDateMethod = "lastPeriod" | "conception";

export const PREGNANCY_LENGTH_DAYS = 280;
export const STANDARD_CYCLE_DAYS = 28;
/** Undfangelse regnes som graviditetsuge 2+0. */
const CONCEPTION_GESTATIONAL_DAYS = 14;

export const MIN_CYCLE_DAYS = 21;
export const MAX_CYCLE_DAYS = 45;
/** Naegeles regel anses kun for sikker ved en regelmæssig cyklus i dette spænd. */
export const RELIABLE_CYCLE_RANGE = [24, 32] as const;

export interface DueDateInput {
  method: DueDateMethod;
  /** ISO-dato fra datofeltet: sidste menstruation eller undfangelse. */
  date: string;
  /** Kun for sidste menstruation; tom streng betyder 28 dage. */
  cycleLength?: string;
  /** ISO-dato for i dag. */
  today: string;
}

export type DueDateMilestoneKind =
  | "scan"
  | "trimester"
  | "fullTerm"
  | "dueDate"
  | "termEnd";

export interface DueDateMilestone {
  kind: DueDateMilestoneKind;
  label: string;
  /** Graviditetsalder som tekst, fx "11+2 – 13+6". */
  weeksLabel: string;
  start: Date;
  /** null for milepæle på én bestemt dag. */
  end: Date | null;
  isPassed: boolean;
  /** I dag ligger inden for milepælen (eller er dagen for den). */
  isCurrent: boolean;
}

export interface DueDateError {
  ok: false;
  message: string;
}

/**
 * planned: datoen ligger i fremtiden, så graviditeten er ikke begyndt.
 * ongoing: i dag ligger i graviditeten.
 * ended: terminsperioden (41+6) er passeret.
 */
export type DueDateStatus = "planned" | "ongoing" | "ended";

export interface DueDateSuccess {
  ok: true;
  status: DueDateStatus;
  dueDate: Date;
  /** Uge 0+0: første dag i sidste menstruation, justeret for cyklus. */
  gestationStart: Date;
  elapsedDays: number;
  /** Hele uger og dage i jordemoderens notation, fx 12+3. */
  gestationalWeeks: number;
  gestationalDays: number;
  /** Den uge, man er i, som de fleste selv siger det: 12+3 er 13. uge. */
  currentWeek: number;
  trimester: 1 | 2 | 3;
  daysUntilDue: number;
  progressPct: number;
  /** Dage terminen er flyttet for en cyklus, der ikke er 28 dage. */
  cycleAdjustmentDays: number;
  isCycleUncertain: boolean;
  milestones: DueDateMilestone[];
  profile: {
    method: DueDateMethod;
    date: Date;
    cycleLength: number | null;
  };
}

export type DueDateResult = DueDateError | DueDateSuccess;

export function formatGestationalAge(totalDays: number): string {
  return `${Math.floor(totalDays / 7)}+${totalDays % 7}`;
}

function weeksToDays(weeks: number, days = 0): number {
  return weeks * 7 + days;
}

const MILESTONES: {
  kind: DueDateMilestoneKind;
  label: string;
  startDays: number;
  endDays?: number;
}[] = [
  {
    kind: "scan",
    label: "Nakkefoldsscanning (1. trimester-scanning)",
    startDays: weeksToDays(11, 2),
    endDays: weeksToDays(13, 6),
  },
  { kind: "trimester", label: "2. trimester begynder", startDays: weeksToDays(14) },
  {
    kind: "scan",
    label: "Misdannelsesscanning (2. trimester-scanning)",
    startDays: weeksToDays(18),
    endDays: weeksToDays(20, 6),
  },
  { kind: "trimester", label: "3. trimester begynder", startDays: weeksToDays(28) },
  {
    kind: "fullTerm",
    label: "Du er fuldbåren – terminsperioden begynder",
    startDays: weeksToDays(37),
  },
  { kind: "dueDate", label: "Termin", startDays: weeksToDays(40) },
  { kind: "termEnd", label: "Terminsperioden slutter", startDays: weeksToDays(41, 6) },
];

const TERM_END_DAYS = weeksToDays(41, 6);

export function trimesterFor(gestationalDays: number): 1 | 2 | 3 {
  if (gestationalDays < weeksToDays(14)) return 1;
  if (gestationalDays < weeksToDays(28)) return 2;
  return 3;
}

export function computeDueDate(input: DueDateInput): DueDateResult {
  const today = parseIsoDate(input.today);
  if (!today) {
    return { ok: false, message: "Dagens dato kunne ikke læses." };
  }

  const date = parseIsoDate(input.date);
  if (!date) {
    return { ok: false, message: "Vælg en gyldig dato." };
  }

  let cycleLength: number | null = null;
  let cycleAdjustmentDays = 0;
  let gestationStart: Date;

  if (input.method === "lastPeriod") {
    const enteredCycle = (input.cycleLength ?? "").trim();
    cycleLength =
      enteredCycle === "" ? STANDARD_CYCLE_DAYS : parseDecimal(enteredCycle);
    if (
      !Number.isInteger(cycleLength) ||
      cycleLength < MIN_CYCLE_DAYS ||
      cycleLength > MAX_CYCLE_DAYS
    ) {
      return {
        ok: false,
        message: `Indtast en cykluslængde mellem ${MIN_CYCLE_DAYS} og ${MAX_CYCLE_DAYS} dage.`,
      };
    }
    cycleAdjustmentDays = cycleLength - STANDARD_CYCLE_DAYS;
    gestationStart = addDays(date, cycleAdjustmentDays);
  } else {
    gestationStart = addDays(date, -CONCEPTION_GESTATIONAL_DAYS);
  }

  const dueDate = addDays(gestationStart, PREGNANCY_LENGTH_DAYS);
  // En lang cyklus kan lægge graviditetens start efter i dag; så er man i uge 0.
  const elapsedDays = Math.max(0, daysBetween(gestationStart, today));

  const status: DueDateStatus =
    date.getTime() > today.getTime()
      ? "planned"
      : elapsedDays > TERM_END_DAYS
        ? "ended"
        : "ongoing";

  const milestones = MILESTONES.map((milestone) => ({
    kind: milestone.kind,
    label: milestone.label,
    weeksLabel:
      milestone.endDays === undefined
        ? formatGestationalAge(milestone.startDays)
        : `${formatGestationalAge(milestone.startDays)} – ${formatGestationalAge(milestone.endDays)}`,
    start: addDays(gestationStart, milestone.startDays),
    end:
      milestone.endDays === undefined
        ? null
        : addDays(gestationStart, milestone.endDays),
    isPassed: elapsedDays > (milestone.endDays ?? milestone.startDays),
    isCurrent:
      elapsedDays >= milestone.startDays &&
      elapsedDays <= (milestone.endDays ?? milestone.startDays),
  }));

  return {
    ok: true,
    status,
    dueDate,
    gestationStart,
    elapsedDays,
    gestationalWeeks: Math.floor(elapsedDays / 7),
    gestationalDays: elapsedDays % 7,
    currentWeek: Math.floor(elapsedDays / 7) + 1,
    trimester: trimesterFor(elapsedDays),
    daysUntilDue: daysBetween(today, dueDate),
    progressPct: Math.min(
      100,
      Math.round((elapsedDays / PREGNANCY_LENGTH_DAYS) * 100)
    ),
    cycleAdjustmentDays,
    isCycleUncertain:
      cycleLength !== null &&
      (cycleLength < RELIABLE_CYCLE_RANGE[0] ||
        cycleLength > RELIABLE_CYCLE_RANGE[1]),
    milestones,
    profile: { method: input.method, date, cycleLength },
  };
}
