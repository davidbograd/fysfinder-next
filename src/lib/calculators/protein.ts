// Fysfinder – proteinberegner
//
// Anbefalingerne er g protein pr. kg kropsvaegt pr. dag og foelger de gaengse
// intervaller: ca. 0,8 g/kg som minimum for stillesiddende voksne, 1,6-2,2 g/kg
// ved styrketraening og muskelopbygning, og lidt hoejere under vaegttab, hvor
// protein beskytter muskelmassen. Fra 65 aar haeves bundgraensen, fordi aeldre
// har brug for mere protein for den samme muskelopbyggende effekt.

import { parseDecimal } from "./parse";

export type ProteinGoal = "vaegttab" | "vedligehold" | "muskelopbygning";
export type ProteinActivity =
  | "stillesiddende"
  | "let"
  | "moderat"
  | "haard";

export interface ProteinInput {
  weightKg: string;
  age: string;
  goal: ProteinGoal;
  activity: ProteinActivity;
  mealsPerDay: string;
}

export interface ProteinError {
  ok: false;
  message: string;
}

export interface ProteinSuccess {
  ok: true;
  gramsPerKgLow: number;
  gramsPerKgHigh: number;
  gramsPerDayLow: number;
  gramsPerDayHigh: number;
  gramsPerDayTarget: number;
  mealsPerDay: number;
  gramsPerMeal: number;
  kcalFromProtein: number;
  /** True når 65+ har hævet bundgrænsen over det valgte niveau. */
  isSeniorAdjusted: boolean;
  /** De tolkede input, så resultatet kan gentage, hvad der blev regnet på. */
  profile: {
    age: number;
    weightKg: number;
    goal: ProteinGoal;
    activity: ProteinActivity;
  };
}

export type ProteinResult = ProteinError | ProteinSuccess;

export const SENIOR_AGE = 65;
const SENIOR_MIN_PER_KG = 1.2;
const SENIOR_MIN_UPPER_PER_KG = 1.5;
const KCAL_PER_GRAM_PROTEIN = 4;
export const DEFAULT_MEALS_PER_DAY = 4;

const RANGES: Record<ProteinGoal, Record<ProteinActivity, [number, number]>> = {
  vedligehold: {
    stillesiddende: [0.8, 1.0],
    let: [1.0, 1.2],
    moderat: [1.2, 1.6],
    haard: [1.4, 1.8],
  },
  vaegttab: {
    stillesiddende: [1.2, 1.6],
    let: [1.4, 1.8],
    moderat: [1.6, 2.2],
    haard: [1.8, 2.4],
  },
  muskelopbygning: {
    stillesiddende: [1.4, 1.6],
    let: [1.5, 1.8],
    moderat: [1.6, 2.0],
    haard: [1.8, 2.2],
  },
};

export function proteinRangePerKg(
  goal: ProteinGoal,
  activity: ProteinActivity,
  age: number
): { low: number; high: number; isSeniorAdjusted: boolean } {
  const [baseLow, baseHigh] = RANGES[goal][activity];

  if (age < SENIOR_AGE) {
    return { low: baseLow, high: baseHigh, isSeniorAdjusted: false };
  }

  const low = Math.max(baseLow, SENIOR_MIN_PER_KG);
  const high = Math.max(baseHigh, SENIOR_MIN_UPPER_PER_KG);

  return {
    low,
    high,
    isSeniorAdjusted: low > baseLow || high > baseHigh,
  };
}

export function computeProteinNeed(input: ProteinInput): ProteinResult {
  const weightKg = parseDecimal(input.weightKg);
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 400) {
    return { ok: false, message: "Indtast en vægt mellem 30 og 400 kg." };
  }

  const age = parseDecimal(input.age);
  if (!Number.isFinite(age) || age < 15 || age > 120) {
    return { ok: false, message: "Indtast en alder mellem 15 og 120 år." };
  }

  const enteredMeals = (input.mealsPerDay ?? "").trim();
  const parsedMeals =
    enteredMeals === "" ? DEFAULT_MEALS_PER_DAY : parseDecimal(enteredMeals);
  if (!Number.isFinite(parsedMeals) || parsedMeals < 2 || parsedMeals > 8) {
    return { ok: false, message: "Vælg mellem 2 og 8 måltider om dagen." };
  }
  const mealsPerDay = Math.round(parsedMeals);

  const { low, high, isSeniorAdjusted } = proteinRangePerKg(
    input.goal,
    input.activity,
    age
  );

  const gramsPerDayLow = Math.round(low * weightKg);
  const gramsPerDayHigh = Math.round(high * weightKg);
  const gramsPerDayTarget =
    Math.round(((low + high) / 2) * weightKg / 5) * 5;

  return {
    ok: true,
    gramsPerKgLow: low,
    gramsPerKgHigh: high,
    gramsPerDayLow,
    gramsPerDayHigh,
    gramsPerDayTarget,
    mealsPerDay,
    gramsPerMeal: Math.round(gramsPerDayTarget / mealsPerDay),
    kcalFromProtein: Math.round(gramsPerDayTarget * KCAL_PER_GRAM_PROTEIN),
    isSeniorAdjusted,
    profile: {
      age,
      weightKg,
      goal: input.goal,
      activity: input.activity,
    },
  };
}
