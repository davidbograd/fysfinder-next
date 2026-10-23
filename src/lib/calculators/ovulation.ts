// Fysfinder – ægløsningsberegner
//
// Ægløsningen sker ca. en lutealfase (typisk 14 dage) FØR næste menstruation –
// ikke 14 dage efter den forrige. Det frugtbare vindue er de 5 dage før
// ægløsningen plus selve ægløsningsdagen, og chancen er størst de sidste 3 af
// de dage (Wilcox et al., NEJM 1995). Ægløsningen flytter sig fra cyklus til
// cyklus, så beregningen er et estimat (Wilcox et al., BMJ 2000).

import { parseDecimal } from "./parse";
import { addDays, daysBetween, parseIsoDate } from "./dates";
import { PREGNANCY_LENGTH_DAYS, STANDARD_CYCLE_DAYS } from "./due-date";

export const DEFAULT_LUTEAL_PHASE_DAYS = 14;
export const MIN_LUTEAL_PHASE_DAYS = 10;
export const MAX_LUTEAL_PHASE_DAYS = 16;
export const MIN_CYCLE_DAYS = 21;
export const MAX_CYCLE_DAYS = 45;
export const FERTILE_DAYS_BEFORE_OVULATION = 5;
export const PEAK_DAYS_BEFORE_OVULATION = 2;
/** Ægløsning tidligere end det i cyklus er ikke et realistisk estimat. */
const MIN_DAYS_BEFORE_OVULATION = 7;
export const CYCLES_SHOWN = 3;

export interface OvulationInput {
  /** ISO-dato for første dag i seneste menstruation. */
  lastPeriodStart: string;
  cycleLength: string;
  /** Tom streng betyder 14 dage. */
  lutealPhase?: string;
  /** ISO-dato for i dag. */
  today: string;
}

export interface OvulationCycle {
  periodStart: Date;
  fertileStart: Date;
  peakStart: Date;
  ovulation: Date;
  nextPeriod: Date;
  /** Forventet termin, hvis man bliver gravid i denne cyklus. */
  dueDateIfConceived: Date;
  /** Ægløsningsdagen er passeret. */
  isPast: boolean;
}

export interface OvulationError {
  ok: false;
  message: string;
}

export interface OvulationSuccess {
  ok: true;
  /** Den første cyklus, hvis ægløsning ikke er passeret endnu. */
  upcoming: OvulationCycle;
  cycles: OvulationCycle[];
  /** Dage fra i dag til næste ægløsning; 0 betyder i dag. */
  daysUntilOvulation: number;
  isFertileToday: boolean;
  profile: {
    lastPeriodStart: Date;
    cycleLength: number;
    lutealPhase: number;
  };
}

export type OvulationResult = OvulationError | OvulationSuccess;

function parseWholeDays(value: string): number {
  const parsed = parseDecimal(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function buildCycle(
  periodStart: Date,
  cycleLength: number,
  lutealPhase: number,
  today: Date
): OvulationCycle {
  const nextPeriod = addDays(periodStart, cycleLength);
  const ovulation = addDays(nextPeriod, -lutealPhase);
  return {
    periodStart,
    fertileStart: addDays(ovulation, -FERTILE_DAYS_BEFORE_OVULATION),
    peakStart: addDays(ovulation, -PEAK_DAYS_BEFORE_OVULATION),
    ovulation,
    nextPeriod,
    dueDateIfConceived: addDays(
      periodStart,
      PREGNANCY_LENGTH_DAYS + cycleLength - STANDARD_CYCLE_DAYS
    ),
    isPast: ovulation.getTime() < today.getTime(),
  };
}

export function computeOvulation(input: OvulationInput): OvulationResult {
  const today = parseIsoDate(input.today);
  if (!today) {
    return { ok: false, message: "Dagens dato kunne ikke læses." };
  }

  const lastPeriodStart = parseIsoDate(input.lastPeriodStart);
  if (!lastPeriodStart) {
    return {
      ok: false,
      message: "Vælg første dag i din seneste menstruation.",
    };
  }

  const daysSincePeriod = daysBetween(lastPeriodStart, today);

  const cycleLength = parseWholeDays(input.cycleLength);
  if (
    !Number.isFinite(cycleLength) ||
    cycleLength < MIN_CYCLE_DAYS ||
    cycleLength > MAX_CYCLE_DAYS
  ) {
    return {
      ok: false,
      message: `Indtast en cykluslængde mellem ${MIN_CYCLE_DAYS} og ${MAX_CYCLE_DAYS} dage.`,
    };
  }

  const enteredLuteal = (input.lutealPhase ?? "").trim();
  const lutealPhase =
    enteredLuteal === "" ? DEFAULT_LUTEAL_PHASE_DAYS : parseWholeDays(enteredLuteal);
  if (
    !Number.isFinite(lutealPhase) ||
    lutealPhase < MIN_LUTEAL_PHASE_DAYS ||
    lutealPhase > MAX_LUTEAL_PHASE_DAYS
  ) {
    return {
      ok: false,
      message: `Indtast en lutealfase mellem ${MIN_LUTEAL_PHASE_DAYS} og ${MAX_LUTEAL_PHASE_DAYS} dage – eller lad feltet stå tomt.`,
    };
  }

  if (cycleLength - lutealPhase < MIN_DAYS_BEFORE_OVULATION) {
    return {
      ok: false,
      message:
        "Lutealfasen er for lang i forhold til din cyklus. Tjek dine tal, eller lad lutealfasen stå tom.",
    };
  }

  // Ligger datoen længere tilbage, rulles der videre til den cyklus, vi er i nu.
  // Ligger den i fremtiden, regnes der fra den cyklus, datoen starter.
  const elapsedCycles = Math.max(0, Math.floor(daysSincePeriod / cycleLength));
  const cycles = Array.from({ length: CYCLES_SHOWN + 1 }, (_, index) =>
    buildCycle(
      addDays(lastPeriodStart, (elapsedCycles + index) * cycleLength),
      cycleLength,
      lutealPhase,
      today
    )
  );

  const upcomingIndex = cycles.findIndex((cycle) => !cycle.isPast);
  const shown = cycles.slice(upcomingIndex, upcomingIndex + CYCLES_SHOWN);
  const upcoming = shown[0];

  return {
    ok: true,
    upcoming,
    cycles: shown,
    daysUntilOvulation: daysBetween(today, upcoming.ovulation),
    isFertileToday:
      today.getTime() >= upcoming.fertileStart.getTime() &&
      today.getTime() <= upcoming.ovulation.getTime(),
    profile: { lastPeriodStart, cycleLength, lutealPhase },
  };
}
