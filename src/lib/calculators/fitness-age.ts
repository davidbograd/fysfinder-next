// Fysfinder – bodyage beregner (konditionsalder)
//
// Kroppens alder er her den alder, hvor gennemsnitspersonen af samme køn har
// det kondital, du har. Konditallet estimeres uden test med NTNU's
// ikke-trænings-model fra HUNT-studiet (Nes et al., Med Sci Sports Exerc 2011),
// med taljemål:
//   Mænd:    100,27 - 0,296 x alder - 0,369 x talje - 0,155 x hvilepuls + 0,226 x PA
//   Kvinder: 74,736 - 0,247 x alder - 0,259 x talje - 0,114 x hvilepuls + 0,198 x PA
// PA-indekset er frekvens x varighed x intensitet, pointsat som NTNU selv gør
// det i Kondiskalkulatoren (ntnu.no/cerg/vo2max).
//
// Gennemsnittene pr. tiår er de direkte målte VO2peak-værdier fra HUNT3 Fitness
// (Edvardsen et al., PLoS One 2014, tabel 4). Modellens usikkerhed er ca.
// ±5 ml/kg/min, hvilket svarer til omkring ±5 år.

import type { Gender } from "@/lib/bodyFat";
import { parseDecimal } from "./parse";

export type ExerciseFrequency = "sjaeldent" | "ugentligt" | "flereGange" | "dagligt";
export type ExerciseIntensity = "let" | "moderat" | "haard";
export type ExerciseDuration = "kort" | "lang";

export const FREQUENCY_POINTS: Record<ExerciseFrequency, number> = {
  sjaeldent: 0,
  ugentligt: 1,
  flereGange: 2,
  dagligt: 3,
};

export const INTENSITY_POINTS: Record<ExerciseIntensity, number> = {
  let: 0,
  moderat: 5,
  haard: 10,
};

export const DURATION_POINTS: Record<ExerciseDuration, number> = {
  kort: 1,
  lang: 1.5,
};

const FREQUENCY_ORDER: ExerciseFrequency[] = [
  "sjaeldent",
  "ugentligt",
  "flereGange",
  "dagligt",
];
const INTENSITY_ORDER: ExerciseIntensity[] = ["let", "moderat", "haard"];

/** Midten af hvert tiår i HUNT3 og det målte gennemsnit (ml/kg/min). */
const REFERENCE_AGES = [25, 35, 45, 55, 65, 75];
const REFERENCE_MEANS: Record<Gender, number[]> = {
  male: [54.0, 48.6, 46.6, 41.9, 38.4, 34.2],
  female: [42.8, 39.6, 37.8, 33.7, 30.5, 26.8],
};

export const MIN_BODY_AGE = 20;
export const MAX_BODY_AGE = 90;
const WAIST_STEP_CM = 5;
const PULSE_STEP_BPM = 5;

export interface Exercise {
  frequency: ExerciseFrequency;
  intensity: ExerciseIntensity;
  duration: ExerciseDuration;
}

export interface FitnessAgeInput extends Exercise {
  gender: Gender | "";
  age: string;
  waistCm: string;
  restingPulse: string;
}

export type FitnessAgeLeverKey = "waist" | "pulse" | "activity";

export interface FitnessAgeLever {
  key: FitnessAgeLeverKey;
  label: string;
  bodyAge: number;
  yearsYounger: number;
}

export interface FitnessAgeError {
  ok: false;
  message: string;
}

export interface FitnessAgeSuccess {
  ok: true;
  bodyAge: number;
  /** Kropsalder minus faktisk alder; negativ betyder yngre krop. */
  difference: number;
  /** Rammer modellens yderpunkter, så resultatet skal læses som "eller yngre/ældre". */
  isAtFloor: boolean;
  isAtCeiling: boolean;
  estimatedVo2: number;
  averageVo2ForAge: number;
  activityIndex: number;
  /** Bedste forbedringer først. */
  levers: FitnessAgeLever[];
  profile: Exercise & {
    gender: Gender;
    age: number;
    waistCm: number;
    restingPulse: number;
  };
}

export type FitnessAgeResult = FitnessAgeError | FitnessAgeSuccess;

export function activityIndex(exercise: Exercise): number {
  return (
    FREQUENCY_POINTS[exercise.frequency] *
    INTENSITY_POINTS[exercise.intensity] *
    DURATION_POINTS[exercise.duration]
  );
}

export function estimateVo2(
  gender: Gender,
  age: number,
  waistCm: number,
  restingPulse: number,
  paIndex: number
): number {
  if (gender === "male") {
    return (
      100.27 -
      0.296 * age -
      0.369 * waistCm -
      0.155 * restingPulse +
      0.226 * paIndex
    );
  }
  return (
    74.736 -
    0.247 * age -
    0.259 * waistCm -
    0.114 * restingPulse +
    0.198 * paIndex
  );
}

/** Lineært mellem tiårene og forlænget med den nærmeste hældning i enderne. */
export function averageVo2ForAge(gender: Gender, age: number): number {
  const means = REFERENCE_MEANS[gender];
  const last = REFERENCE_AGES.length - 1;
  let segment = REFERENCE_AGES.findIndex(
    (refAge, index) => index < last && age <= REFERENCE_AGES[index + 1]
  );
  if (segment === -1) segment = last - 1;

  const [age0, age1] = [REFERENCE_AGES[segment], REFERENCE_AGES[segment + 1]];
  const [mean0, mean1] = [means[segment], means[segment + 1]];
  return mean0 + ((age - age0) / (age1 - age0)) * (mean1 - mean0);
}

/** Den alder, hvor gennemsnittet for kønnet har dette kondital. */
export function bodyAgeForVo2(gender: Gender, vo2: number): number {
  const means = REFERENCE_MEANS[gender];
  const last = REFERENCE_AGES.length - 1;
  let segment = means.findIndex(
    (_, index) => index < last && vo2 >= means[index + 1]
  );
  if (segment === -1) segment = last - 1;

  const [age0, age1] = [REFERENCE_AGES[segment], REFERENCE_AGES[segment + 1]];
  const [mean0, mean1] = [means[segment], means[segment + 1]];
  const age = age0 + ((mean0 - vo2) / (mean0 - mean1)) * (age1 - age0);
  return Math.min(MAX_BODY_AGE, Math.max(MIN_BODY_AGE, Math.round(age)));
}

function nextExerciseStep(
  exercise: Exercise
): { exercise: Exercise; label: string } | null {
  // Uden træning med pust giver hverken flere eller længere ture point, så det
  // første skridt er at komme i gang med træning, man bliver forpustet af.
  if (activityIndex(exercise) === 0) {
    return {
      exercise: { frequency: "flereGange", intensity: "moderat", duration: "lang" },
      label: "Træn 2–3 gange om ugen, så du bliver forpustet og svedig",
    };
  }

  const candidates: { exercise: Exercise; label: string }[] = [];
  const intensityIndex = INTENSITY_ORDER.indexOf(exercise.intensity);
  if (intensityIndex < INTENSITY_ORDER.length - 1) {
    candidates.push({
      exercise: { ...exercise, intensity: INTENSITY_ORDER[intensityIndex + 1] },
      label: "Træn hårdere – tag dig helt ud i nogle af intervallerne",
    });
  }
  const frequencyIndex = FREQUENCY_ORDER.indexOf(exercise.frequency);
  if (frequencyIndex < FREQUENCY_ORDER.length - 1) {
    candidates.push({
      exercise: { ...exercise, frequency: FREQUENCY_ORDER[frequencyIndex + 1] },
      label: "Læg en ekstra træningsdag ind om ugen",
    });
  }
  if (exercise.duration === "kort") {
    candidates.push({
      exercise: { ...exercise, duration: "lang" },
      label: "Træn mindst 30 minutter ad gangen",
    });
  }

  return (
    candidates.sort(
      (a, b) => activityIndex(b.exercise) - activityIndex(a.exercise)
    )[0] ?? null
  );
}

export function computeFitnessAge(input: FitnessAgeInput): FitnessAgeResult {
  if (input.gender !== "male" && input.gender !== "female") {
    return {
      ok: false,
      message: "Vælg køn – mænd og kvinder har forskelligt kondital.",
    };
  }

  const age = parseDecimal(input.age);
  if (!Number.isFinite(age) || age < 20 || age > 90) {
    return {
      ok: false,
      message: "Indtast en alder mellem 20 og 90 år – modellen er lavet til voksne.",
    };
  }

  const waistCm = parseDecimal(input.waistCm);
  if (!Number.isFinite(waistCm) || waistCm < 50 || waistCm > 200) {
    return { ok: false, message: "Indtast et taljemål mellem 50 og 200 cm." };
  }

  const restingPulse = parseDecimal(input.restingPulse);
  if (!Number.isFinite(restingPulse) || restingPulse < 30 || restingPulse > 120) {
    return {
      ok: false,
      message: "Indtast en hvilepuls mellem 30 og 120 slag i minuttet.",
    };
  }

  const gender = input.gender;
  const exercise: Exercise = {
    frequency: input.frequency,
    intensity: input.intensity,
    duration: input.duration,
  };
  const paIndex = activityIndex(exercise);
  const vo2 = estimateVo2(gender, age, waistCm, restingPulse, paIndex);
  const bodyAge = bodyAgeForVo2(gender, vo2);

  const leverFor = (
    key: FitnessAgeLeverKey,
    label: string,
    changed: { waistCm?: number; restingPulse?: number; exercise?: Exercise }
  ): FitnessAgeLever => {
    const leverAge = bodyAgeForVo2(
      gender,
      estimateVo2(
        gender,
        age,
        changed.waistCm ?? waistCm,
        changed.restingPulse ?? restingPulse,
        activityIndex(changed.exercise ?? exercise)
      )
    );
    return { key, label, bodyAge: leverAge, yearsYounger: bodyAge - leverAge };
  };

  const levers: FitnessAgeLever[] = [
    leverFor("waist", `${WAIST_STEP_CM} cm mindre taljemål`, {
      waistCm: waistCm - WAIST_STEP_CM,
    }),
    leverFor("pulse", `${PULSE_STEP_BPM} slag lavere hvilepuls`, {
      restingPulse: restingPulse - PULSE_STEP_BPM,
    }),
  ];
  const step = nextExerciseStep(exercise);
  if (step) {
    levers.push(leverFor("activity", step.label, { exercise: step.exercise }));
  }

  return {
    ok: true,
    bodyAge,
    difference: bodyAge - Math.round(age),
    isAtFloor: bodyAge === MIN_BODY_AGE,
    isAtCeiling: bodyAge === MAX_BODY_AGE,
    estimatedVo2: Math.round(vo2 * 10) / 10,
    averageVo2ForAge: Math.round(averageVo2ForAge(gender, age) * 10) / 10,
    activityIndex: paIndex,
    levers: levers
      .filter((lever) => lever.yearsYounger > 0)
      .sort((a, b) => b.yearsYounger - a.yearsYounger),
    profile: { ...exercise, gender, age, waistCm, restingPulse },
  };
}
