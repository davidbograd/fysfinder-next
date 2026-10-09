// Fysfinder – muskelmasse beregner
//
// To metoder til det samme estimat af skeletmuskelmasse:
//   - "tape": Navy-maalene giver fedtprocent -> fedtfri masse -> muskelmasse.
//     Skeletmuskulaturen udgoer ca. 53 % af den fedtfrie masse hos maend og
//     ca. 48 % hos kvinder.
//   - "simple": Lees antropometriske ligning (2000) ud fra hoejde, vaegt,
//     alder og koen. Race-leddet er 0, da ligningen her bruges paa en
//     nordeuropaeisk befolkning.
//
// Muskelmassen klassificeres bevidst ikke: de publicerede graensevaerdier for
// lav muskelmasse er udledt til at forudsige funktionstab hos aeldre, og de
// placerer en helt gennemsnitlig 30-aarig lige omkring graensen. Vi viser
// derfor tallene som de er (og fedtprocent-kategorien, der allerede er vurderet
// i fedtprocent-beregneren) og anbefaler at foelge udviklingen over tid.

import { computeBodyFatFromNumbers, type Gender } from "@/lib/bodyFat";
import { parseDecimal } from "./parse";

export type MuscleMassMethod = "tape" | "simple";

export interface MuscleMassInput {
  method: MuscleMassMethod;
  gender: Gender | "";
  age: string;
  heightCm: string;
  weightKg: string;
  neckCm?: string;
  waistCm?: string;
  hipCm?: string;
}

export interface MuscleMassError {
  ok: false;
  message: string;
}

export interface MuscleMassSuccess {
  ok: true;
  method: MuscleMassMethod;
  muscleMassKg: number;
  muscleSharePct: number;
  /** Muskelmasse pr. højde i anden – gør tal fra forskellige kroppe sammenlignelige. */
  muscleIndex: number;
  /** Kun for målebånds-metoden. */
  bodyFatPct: number | null;
  bodyFatCategory: string | null;
  fatMassKg: number | null;
  leanMassKg: number | null;
  /** De tolkede input, så resultatet kan gentage, hvad der blev regnet på. */
  profile: {
    gender: Gender;
    age: number;
    heightCm: number;
    weightKg: number;
  };
}

export type MuscleMassResult = MuscleMassError | MuscleMassSuccess;

export const SKELETAL_MUSCLE_SHARE_OF_LEAN_MASS: Record<Gender, number> = {
  male: 0.53,
  female: 0.48,
};

/** Lee et al. (2000), antropometrisk ligning for skeletmuskelmasse. */
export function leeSkeletalMuscleMass(
  gender: Gender,
  age: number,
  heightCm: number,
  weightKg: number
): number {
  return (
    0.244 * weightKg +
    7.8 * (heightCm / 100) -
    0.098 * age +
    (gender === "male" ? 6.6 : 0) -
    3.3
  );
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computeMuscleMass(input: MuscleMassInput): MuscleMassResult {
  if (input.gender !== "male" && input.gender !== "female") {
    return { ok: false, message: "Vælg køn, så vi kan beregne din muskelmasse." };
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

  let muscleMassKg: number;
  let bodyFatPct: number | null = null;
  let bodyFatCategory: string | null = null;
  let fatMassKg: number | null = null;
  let leanMassKg: number | null = null;

  if (input.method === "tape") {
    const bodyFat = computeBodyFatFromNumbers({
      gender: input.gender,
      unit: "cm",
      height: heightCm,
      neck: parseDecimal(input.neckCm ?? ""),
      waist: parseDecimal(input.waistCm ?? ""),
      hip: input.gender === "female" ? parseDecimal(input.hipCm ?? "") : undefined,
      weightKg,
    });

    if (!bodyFat.ok) {
      return { ok: false, message: bodyFat.message };
    }

    bodyFatPct = bodyFat.bfp;
    bodyFatCategory = bodyFat.category;
    fatMassKg = bodyFat.fatMassKg;
    leanMassKg = bodyFat.leanMassKg;

    muscleMassKg =
      (leanMassKg ?? 0) * SKELETAL_MUSCLE_SHARE_OF_LEAN_MASS[input.gender];
  } else {
    muscleMassKg = leeSkeletalMuscleMass(input.gender, age, heightCm, weightKg);
  }

  if (!Number.isFinite(muscleMassKg) || muscleMassKg <= 0) {
    return {
      ok: false,
      message: "Tallene giver ikke et gyldigt estimat. Tjek dine indtastninger.",
    };
  }

  const heightM = heightCm / 100;

  return {
    ok: true,
    method: input.method,
    muscleMassKg: roundToOneDecimal(muscleMassKg),
    muscleSharePct: roundToOneDecimal((muscleMassKg / weightKg) * 100),
    muscleIndex: roundToOneDecimal(muscleMassKg / (heightM * heightM)),
    bodyFatPct,
    bodyFatCategory,
    fatMassKg,
    leanMassKg,
    profile: { gender: input.gender, age, heightCm, weightKg },
  };
}
