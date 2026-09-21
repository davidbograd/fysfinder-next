// Fysfinder – hvilestofskifte beregner
//
// Mifflin-St Jeor er i dag den bedst validerede ligning til hvilestofskifte hos
// raske voksne, og er derfor brugt her frem for Harris-Benedict (som
// kalorieberegneren bruger til det samlede energibehov).

import type { Gender } from "@/lib/bodyFat";
import { parseDecimal } from "./parse";

export interface RestingMetabolicRateInput {
  gender: Gender | "";
  age: string;
  heightCm: string;
  weightKg: string;
}

export interface RestingMetabolicRateError {
  ok: false;
  message: string;
}

export interface RestingMetabolicRateSuccess {
  ok: true;
  kcalPerDay: number;
  kjPerDay: number;
  kcalPerHour: number;
  kcalPerKgPerDay: number;
  /** De tolkede input, så resultatet kan gentage, hvad der blev regnet på. */
  profile: {
    gender: Gender;
    age: number;
    heightCm: number;
    weightKg: number;
  };
}

export type RestingMetabolicRateResult =
  | RestingMetabolicRateError
  | RestingMetabolicRateSuccess;

/** Hvilestofskiftets typiske andel af det samlede daglige energiforbrug. */
export const RMR_SHARE_OF_TOTAL_LOW_PCT = 60;
export const RMR_SHARE_OF_TOTAL_HIGH_PCT = 75;

const KJ_PER_KCAL = 4.184;

export function mifflinStJeor(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export function computeRestingMetabolicRate(
  input: RestingMetabolicRateInput
): RestingMetabolicRateResult {
  if (input.gender !== "male" && input.gender !== "female") {
    return {
      ok: false,
      message: "Vælg køn – mænd og kvinder har forskelligt hvilestofskifte.",
    };
  }

  const age = parseDecimal(input.age);
  if (!Number.isFinite(age) || age < 15 || age > 120) {
    return { ok: false, message: "Indtast en alder mellem 15 og 120 år." };
  }

  const heightCm = parseDecimal(input.heightCm);
  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 250) {
    return { ok: false, message: "Indtast en højde mellem 120 og 250 cm." };
  }

  const weightKg = parseDecimal(input.weightKg);
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 400) {
    return { ok: false, message: "Indtast en vægt mellem 30 og 400 kg." };
  }

  const kcalPerDay = mifflinStJeor(input.gender, weightKg, heightCm, age);

  if (!Number.isFinite(kcalPerDay) || kcalPerDay <= 0) {
    return {
      ok: false,
      message: "Tallene giver ikke et gyldigt hvilestofskifte. Tjek dine indtastninger.",
    };
  }

  const rounded = Math.round(kcalPerDay);

  return {
    ok: true,
    kcalPerDay: rounded,
    kjPerDay: Math.round(rounded * KJ_PER_KCAL),
    kcalPerHour: Math.round((rounded / 24) * 10) / 10,
    kcalPerKgPerDay: Math.round((rounded / weightKg) * 10) / 10,
    profile: { gender: input.gender, age, heightCm, weightKg },
  };
}
