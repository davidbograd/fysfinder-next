// Fysfinder – proteinberegner
//
// Anbefalingerne er g protein pr. kg kropsvaegt pr. dag og foelger de gaengse
// intervaller: ca. 0,8 g/kg som minimum for stillesiddende voksne, 1,6-2,2 g/kg
// ved styrketraening og muskelopbygning, og lidt hoejere under vaegttab, hvor
// protein beskytter muskelmassen. Fra 65 aar haeves bundgraensen, fordi aeldre
// har brug for mere protein for den samme muskelopbyggende effekt.
//
// Graviditet og amning laegges oven i som faste gram pr. dag efter NNR 2023
// (https://pub.norden.org/nord2023-003/protein-.html og baggrundsrapporten
// https://pmc.ncbi.nlm.nih.gov/articles/PMC10770649/), som DTU
// Foedevareinstituttet bruger i sit notat om kost til gravide og ammende (2025):
// +1/+9/+28 g i 1./2./3. trimester og +19 g ved fuld amning (0-6 mdr.) / +13 g
// ved delvis amning (efter 6 mdr.). Tillaeggene gaelder oven i behovet ud fra
// vaegten foer graviditeten.

import { parseDecimal } from "./parse";

export type ProteinGoal = "vaegttab" | "vedligehold" | "muskelopbygning";
export type ProteinActivity =
  | "stillesiddende"
  | "let"
  | "moderat"
  | "haard";
export type PregnancyStatus = "nej" | "trimester1" | "trimester2" | "trimester3";
export type LactationStatus = "nej" | "fuld" | "delvis";

export const PREGNANCY_EXTRA_GRAMS: Record<PregnancyStatus, number> = {
  nej: 0,
  trimester1: 1,
  trimester2: 9,
  trimester3: 28,
};

export const LACTATION_EXTRA_GRAMS: Record<LactationStatus, number> = {
  nej: 0,
  fuld: 19,
  delvis: 13,
};

export interface ProteinInput {
  weightKg: string;
  age: string;
  goal: ProteinGoal;
  activity: ProteinActivity;
  mealsPerDay: string;
  pregnancy?: PregnancyStatus;
  lactation?: LactationStatus;
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
  /** Gram pr. dag lagt oven i for graviditet og amning (indgår i dagsværdierne, ikke i g/kg). */
  pregnancyExtraGrams: number;
  lactationExtraGrams: number;
  /** De tolkede input, så resultatet kan gentage, hvad der blev regnet på. */
  profile: {
    age: number;
    weightKg: number;
    goal: ProteinGoal;
    activity: ProteinActivity;
    pregnancy: PregnancyStatus;
    lactation: LactationStatus;
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

  const pregnancy = input.pregnancy ?? "nej";
  const lactation = input.lactation ?? "nej";
  const pregnancyExtraGrams = PREGNANCY_EXTRA_GRAMS[pregnancy];
  const lactationExtraGrams = LACTATION_EXTRA_GRAMS[lactation];
  const extraGrams = pregnancyExtraGrams + lactationExtraGrams;

  const gramsPerDayLow = Math.round(low * weightKg) + extraGrams;
  const gramsPerDayHigh = Math.round(high * weightKg) + extraGrams;
  const gramsPerDayTarget =
    Math.round(((low + high) / 2) * weightKg / 5) * 5 + extraGrams;

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
    pregnancyExtraGrams,
    lactationExtraGrams,
    profile: {
      age,
      weightKg,
      goal: input.goal,
      activity: input.activity,
      pregnancy,
      lactation,
    },
  };
}
