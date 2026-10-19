// Fysfinder – makroberegner
//
// Kalorierne kommer enten fra visitoren selv eller fra Mifflin-St Jeor (samme
// ligning som hvilestofskifte-beregneren) gange et aktivitetsniveau, plus et
// underskud eller overskud efter målet. Fordelingerne:
//   - Proteinfokus: protein i g/kg som proteinberegneren, 30 E% fedt, resten
//     kulhydrat. Det er udgangspunktet for de fleste, der træner.
//   - Nordiske anbefalinger: 15/33/52 E% – NNR 2023's mål til kostplanlægning.
//   - Lavere kulhydrat: protein som proteinfokus, 25 E% kulhydrat, resten fedt.
// Protein og kulhydrat giver 4 kcal/g, fedt 9 kcal/g.

import type { Gender } from "@/lib/bodyFat";
import { parseDecimal } from "./parse";
import { mifflinStJeor } from "./resting-metabolic-rate";
import {
  ProteinActivity,
  ProteinGoal,
  proteinRangePerKg,
} from "./protein";

export type CalorieSource = "estimate" | "known";
export type MacroSplit = "proteinfokus" | "nnr" | "lavkulhydrat";
export type Macro = "protein" | "carbs" | "fat";

export const KCAL_PER_GRAM: Record<Macro, number> = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

export const ACTIVITY_FACTORS: Record<ProteinActivity, number> = {
  stillesiddende: 1.2,
  let: 1.375,
  moderat: 1.55,
  haard: 1.725,
};

/** Samme overskud som kalorieberegneren; 500 kcal under svarer til ca. 0,5 kg om ugen. */
export const GOAL_KCAL_ADJUSTMENT: Record<ProteinGoal, number> = {
  vaegttab: -500,
  vedligehold: 0,
  muskelopbygning: 300,
};

/** NNR 2023's anbefalede intervaller i procent af energien (E%). */
export const NNR_RANGES: Record<Macro, [number, number]> = {
  protein: [10, 20],
  carbs: [45, 60],
  fat: [25, 40],
};

const NNR_SPLIT: Record<Macro, number> = { protein: 15, carbs: 52, fat: 33 };
const PROTEIN_FOCUS_FAT_PCT = 30;
const LOW_CARB_CARBS_PCT = 25;
/** Under det bliver det svært at få nok fedtopløselige vitaminer og essentielle fedtsyrer. */
const MIN_FAT_PCT = 20;

export interface MacroInput {
  calorieSource: CalorieSource;
  /** Kun når visitoren kender sit kalorietal. */
  kcal?: string;
  gender?: Gender | "";
  heightCm?: string;
  weightKg: string;
  age: string;
  activity: ProteinActivity;
  goal: ProteinGoal;
  split: MacroSplit;
}

export interface MacroAmount {
  grams: number;
  kcal: number;
  pct: number;
}

export interface MacroError {
  ok: false;
  message: string;
}

export interface MacroSuccess {
  ok: true;
  kcalPerDay: number;
  /** Kun når kalorierne er beregnet. */
  maintenanceKcal: number | null;
  macros: Record<Macro, MacroAmount>;
  proteinPerKg: number;
  /** Makroer uden for NNR's interval, så resultatet kan forklare hvorfor. */
  outsideNnr: Macro[];
  profile: {
    calorieSource: CalorieSource;
    weightKg: number;
    age: number;
    goal: ProteinGoal;
    activity: ProteinActivity;
    split: MacroSplit;
  };
}

export type MacroResult = MacroError | MacroSuccess;

function amount(macro: Macro, kcal: number, totalKcal: number): MacroAmount {
  return {
    grams: Math.round(kcal / KCAL_PER_GRAM[macro]),
    kcal: Math.round(kcal),
    pct: Math.round((kcal / totalKcal) * 100),
  };
}

function resolveCalories(
  input: MacroInput,
  weightKg: number,
  age: number
): MacroError | { kcalPerDay: number; maintenanceKcal: number | null } {
  if (input.calorieSource === "known") {
    const kcal = parseDecimal(input.kcal ?? "");
    if (!Number.isFinite(kcal) || kcal < 1000 || kcal > 6000) {
      return {
        ok: false,
        message: "Indtast et kalorietal mellem 1.000 og 6.000 kcal om dagen.",
      };
    }
    return { kcalPerDay: Math.round(kcal), maintenanceKcal: null };
  }

  if (input.gender !== "male" && input.gender !== "female") {
    return { ok: false, message: "Vælg køn, så vi kan beregne dit kaloriebehov." };
  }

  const heightCm = parseDecimal(input.heightCm ?? "");
  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 250) {
    return { ok: false, message: "Indtast en højde mellem 120 og 250 cm." };
  }

  const maintenanceKcal = Math.round(
    mifflinStJeor(input.gender, weightKg, heightCm, age) *
      ACTIVITY_FACTORS[input.activity]
  );
  return {
    kcalPerDay: maintenanceKcal + GOAL_KCAL_ADJUSTMENT[input.goal],
    maintenanceKcal,
  };
}

export function computeMacros(input: MacroInput): MacroResult {
  const weightKg = parseDecimal(input.weightKg);
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) {
    return { ok: false, message: "Indtast en vægt mellem 30 og 300 kg." };
  }

  const age = parseDecimal(input.age);
  if (!Number.isFinite(age) || age < 15 || age > 120) {
    return { ok: false, message: "Indtast en alder mellem 15 og 120 år." };
  }

  const calories = resolveCalories(input, weightKg, age);
  if ("ok" in calories) return calories;
  const { kcalPerDay, maintenanceKcal } = calories;

  if (kcalPerDay < 1000) {
    return {
      ok: false,
      message:
        "Dit kalorietal bliver under 1.000 kcal om dagen. Vælg et andet mål, eller tal med en diætist om et så lavt indtag.",
    };
  }

  let proteinKcal: number;
  let carbsKcal: number;
  let fatKcal: number;

  if (input.split === "nnr") {
    proteinKcal = (kcalPerDay * NNR_SPLIT.protein) / 100;
    carbsKcal = (kcalPerDay * NNR_SPLIT.carbs) / 100;
    fatKcal = (kcalPerDay * NNR_SPLIT.fat) / 100;
  } else {
    const { low, high } = proteinRangePerKg(input.goal, input.activity, age);
    proteinKcal = ((low + high) / 2) * weightKg * KCAL_PER_GRAM.protein;

    if (input.split === "proteinfokus") {
      fatKcal = (kcalPerDay * PROTEIN_FOCUS_FAT_PCT) / 100;
      carbsKcal = kcalPerDay - proteinKcal - fatKcal;
    } else {
      carbsKcal = (kcalPerDay * LOW_CARB_CARBS_PCT) / 100;
      fatKcal = kcalPerDay - proteinKcal - carbsKcal;
    }
  }

  if (carbsKcal < 0 || (fatKcal / kcalPerDay) * 100 < MIN_FAT_PCT) {
    return {
      ok: false,
      message:
        "Dit proteinbehov fylder for meget af kalorierne til den fordeling. Vælg en anden fordeling, eller tjek dit kalorietal.",
    };
  }

  const macros: Record<Macro, MacroAmount> = {
    protein: amount("protein", proteinKcal, kcalPerDay),
    carbs: amount("carbs", carbsKcal, kcalPerDay),
    fat: amount("fat", fatKcal, kcalPerDay),
  };

  const outsideNnr = (Object.keys(macros) as Macro[]).filter((macro) => {
    const [min, max] = NNR_RANGES[macro];
    return macros[macro].pct < min || macros[macro].pct > max;
  });

  return {
    ok: true,
    kcalPerDay,
    maintenanceKcal,
    macros,
    proteinPerKg: Math.round((macros.protein.grams / weightKg) * 10) / 10,
    outsideNnr,
    profile: {
      calorieSource: input.calorieSource,
      weightKg,
      age,
      goal: input.goal,
      activity: input.activity,
      split: input.split,
    },
  };
}
