// Fysfinder – kondital (VO2-max) beregner
//
// Two routes to the same number, both in ml O2 per kg per minute:
//   - Hvilepuls: VO2max = 15,3 x (makspuls / hvilepuls) (Uth et al. 2004)
//   - Cooper-testen: VO2max = (meter paa 12 min - 504,9) / 44,73

import type { Gender } from "@/lib/bodyFat";
import { parseDecimal } from "./parse";

export type KonditalMethod = "restingPulse" | "cooper";

export interface KonditalInput {
  method: KonditalMethod;
  gender: Gender | "";
  age: string;
  restingPulse?: string;
  distanceMeters?: string;
  weightKg?: string;
}

export interface KonditalBand {
  label: string;
  /** null on the lowest band, which has no floor. */
  min: number | null;
  /** null on the highest band, which has no ceiling. */
  max: number | null;
}

export interface KonditalError {
  ok: false;
  message: string;
}

export interface KonditalSuccess {
  ok: true;
  kondital: number;
  category: string;
  ageGroupLabel: string;
  bands: KonditalBand[];
  /** Estimated from the age, or null for the Cooper test. */
  maxPulse: number | null;
  /** Absolute oxygen uptake, only when a weight was supplied. */
  litersPerMinute: number | null;
  /** De tolkede input, så resultatet kan gentage, hvad der blev regnet på. */
  profile: {
    gender: Gender;
    age: number;
    method: KonditalMethod;
    /** Kun for hvilepuls-metoden. */
    restingPulse: number | null;
    /** Kun for Cooper-testen. */
    distanceMeters: number | null;
    weightKg: number | null;
  };
}

export type KonditalResult = KonditalError | KonditalSuccess;

export const KONDITAL_CATEGORIES = [
  "Meget lav",
  "Lav",
  "Middel",
  "God",
  "Meget god",
  "Fremragende",
] as const;

interface AgeGroup {
  label: string;
  /** Inclusive upper bound. */
  maxAge: number;
  /** Five cut points between the six categories. */
  thresholds: Record<Gender, number[]>;
}

const AGE_GROUPS: AgeGroup[] = [
  {
    label: "Under 30 år",
    maxAge: 29,
    thresholds: {
      male: [33, 36.5, 42.5, 46.5, 52.5],
      female: [23.6, 29, 33, 37, 41.1],
    },
  },
  {
    label: "30-39 år",
    maxAge: 39,
    thresholds: {
      male: [31.5, 35.5, 41, 45, 49.5],
      female: [22.8, 27, 31.5, 35.7, 41],
    },
  },
  {
    label: "40-49 år",
    maxAge: 49,
    thresholds: {
      male: [30.2, 33.6, 39, 43.8, 48.1],
      female: [21, 24.5, 29, 32.9, 37],
    },
  },
  {
    label: "50-59 år",
    maxAge: 59,
    thresholds: {
      male: [26.1, 31, 35.8, 41, 45.4],
      female: [20.2, 22.8, 27, 31.5, 35.8],
    },
  },
  {
    label: "60 år og derover",
    maxAge: Number.POSITIVE_INFINITY,
    thresholds: {
      male: [20.5, 26.1, 32.3, 36.5, 44.3],
      female: [17.5, 20.2, 24.5, 30.3, 31.5],
    },
  },
];

/** Tanaka et al. (2001) – more accurate across ages than "220 minus alder". */
export function estimateMaxPulse(age: number): number {
  return Math.round(208 - 0.7 * age);
}

function findAgeGroup(age: number): AgeGroup {
  return (
    AGE_GROUPS.find((group) => age <= group.maxAge) ??
    AGE_GROUPS[AGE_GROUPS.length - 1]
  );
}

export function buildKonditalBands(
  gender: Gender,
  age: number
): { ageGroupLabel: string; bands: KonditalBand[] } {
  const group = findAgeGroup(age);
  const thresholds = group.thresholds[gender];

  const bands = KONDITAL_CATEGORIES.map((label, index) => ({
    label,
    min: index === 0 ? null : thresholds[index - 1],
    max: index === thresholds.length ? null : thresholds[index],
  }));

  return { ageGroupLabel: group.label, bands };
}

export function classifyKondital(
  gender: Gender,
  age: number,
  kondital: number
): string {
  const thresholds = findAgeGroup(age).thresholds[gender];
  const index = thresholds.findIndex((threshold) => kondital < threshold);
  return index === -1
    ? KONDITAL_CATEGORIES[KONDITAL_CATEGORIES.length - 1]
    : KONDITAL_CATEGORIES[index];
}

export function computeKondital(input: KonditalInput): KonditalResult {
  if (input.gender !== "male" && input.gender !== "female") {
    return { ok: false, message: "Vælg køn, så vi kan vurdere dit kondital." };
  }

  const age = parseDecimal(input.age);
  if (!Number.isFinite(age) || age < 10 || age > 110) {
    return { ok: false, message: "Indtast en alder mellem 10 og 110 år." };
  }

  let kondital: number;
  let maxPulse: number | null = null;
  let restingPulseUsed: number | null = null;
  let distanceUsed: number | null = null;

  if (input.method === "restingPulse") {
    const restingPulse = parseDecimal(input.restingPulse ?? "");
    if (!Number.isFinite(restingPulse) || restingPulse < 30 || restingPulse > 120) {
      return {
        ok: false,
        message: "Indtast en hvilepuls mellem 30 og 120 slag i minuttet.",
      };
    }

    // Vi spørger ikke om makspuls – de færreste kender deres egen, og den
    // aldersbaserede estimering rammer tæt nok til formlen her.
    maxPulse = estimateMaxPulse(age);
    restingPulseUsed = restingPulse;
    kondital = 15.3 * (maxPulse / restingPulse);
  } else {
    const distance = parseDecimal(input.distanceMeters ?? "");
    if (!Number.isFinite(distance) || distance < 400 || distance > 8000) {
      return {
        ok: false,
        message: "Indtast en distance mellem 400 og 8.000 meter.",
      };
    }
    distanceUsed = distance;
    kondital = (distance - 504.9) / 44.73;
  }

  const clamped = Math.min(90, Math.max(10, kondital));
  const rounded = Math.round(clamped * 10) / 10;

  const weightKg = parseDecimal(input.weightKg ?? "");
  const hasWeight =
    Number.isFinite(weightKg) && weightKg >= 20 && weightKg <= 400;

  const { ageGroupLabel, bands } = buildKonditalBands(input.gender, age);

  return {
    ok: true,
    kondital: rounded,
    category: classifyKondital(input.gender, age, rounded),
    ageGroupLabel,
    bands,
    maxPulse,
    litersPerMinute: hasWeight
      ? Math.round((rounded * weightKg) / 10) / 100
      : null,
    profile: {
      gender: input.gender,
      age,
      method: input.method,
      restingPulse: restingPulseUsed,
      distanceMeters: distanceUsed,
      weightKg: hasWeight ? weightKg : null,
    },
  };
}
