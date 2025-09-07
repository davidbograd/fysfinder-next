// FysFinder – Navy body fat calculator logic

export type Gender = "male" | "female";
export type Unit = "cm" | "in";

export interface InputStrings {
  gender: Gender;
  unit: Unit;
  height: string;   // højde
  neck: string;     // hals
  waist: string;    // talje
  hip?: string;     // hofte (kvinder)
  weightKg?: string; // valgfrit, kg
}

export interface InputNumbers {
  gender: Gender;
  unit: Unit;
  height: number;
  neck: number;
  waist: number;
  hip?: number;
  weightKg?: number;
}

export interface ErrorResult {
  ok: false;
  message: string; // Danish message for UI
}

export interface SuccessResult {
  ok: true;
  bfp: number;               // body fat %, rounded 1 decimal
  category: string;          // Danish classification
  fatMassKg: number | null;  // if weight provided
  leanMassKg: number | null; // if weight provided
}

export type BodyFatResult = ErrorResult | SuccessResult;

/** Accepts komma/punktum decimals, trims whitespace. */
export const parseNumLoose = (v: string | number | null | undefined): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  if (typeof v !== "string") return NaN;
  const norm = v.replace(",", ".").trim();
  const n = Number(norm);
  return Number.isFinite(n) ? n : NaN;
};

/** Convert cm→inches if needed. */
export const toInches = (val: number, unit: Unit): number => {
  return unit === "cm" ? val / 2.54 : val;
};

/** Classification bands in Danish. */
export const classifyCategory = (gender: Gender, v: number): string => {
  if (gender === "male") {
    if (v < 6) return "Essentielt fedt";
    if (v < 14) return "Atletisk";
    if (v < 18) return "Fitness";
    if (v < 25) return "Gennemsnit";
    return "Høj (overvægt)";
  } else {
    if (v < 14) return "Essentielt fedt";
    if (v < 21) return "Atletisk";
    if (v < 25) return "Fitness";
    if (v < 32) return "Gennemsnit";
    return "Høj (overvægt)";
  }
};

/** Raw Navy formula, in inches. */
export const navyBodyFatPercentageInches = (
  gender: Gender,
  heightIn: number,
  neckIn: number,
  waistIn: number,
  hipIn: number = 0
): number => {
  if (gender === "male") {
    return (
      86.01 * Math.log10(waistIn - neckIn) -
      70.041 * Math.log10(heightIn) +
      36.76
    );
  } else {
    return (
      163.205 * Math.log10(waistIn + hipIn - neckIn) -
      97.684 * Math.log10(heightIn) -
      78.387
    );
  }
};

/** Compute from numeric inputs. */
export const computeBodyFatFromNumbers = (input: InputNumbers): BodyFatResult => {
  const { gender, unit, height, neck, waist, hip, weightKg } = input;

  if (![height, neck, waist].every(Number.isFinite) || height <= 0 || neck <= 0 || waist <= 0) {
    return { ok: false, message: "Udfyld gyldige tal for højde, hals og talje." };
  }

  if (gender === "female" && (!Number.isFinite(hip) || (hip ?? 0) <= 0)) {
    return { ok: false, message: "Udfyld et gyldigt tal for hofte (kun for kvinder)." };
  }

  const heightIn = toInches(height, unit);
  const neckIn = toInches(neck, unit);
  const waistIn = toInches(waist, unit);
  const hipIn = gender === "female" ? toInches(hip as number, unit) : 0;

  if (gender === "male" && waistIn - neckIn <= 0) {
    return { ok: false, message: "Talje skal være større end hals for beregning." };
  }
  if (gender === "female" && waistIn + hipIn - neckIn <= 0) {
    return { ok: false, message: "Talje + hofte skal være større end hals for beregning." };
  }

  let bfp = navyBodyFatPercentageInches(gender, heightIn, neckIn, waistIn, hipIn);

  // Clamp + round
  bfp = Math.min(75, Math.max(2, bfp));
  const bfpRounded = Math.round(bfp * 10) / 10;

  // Optional fat/lean mass
  const hasWeight = Number.isFinite(weightKg) && (weightKg as number) > 0;
  const fatMassKg = hasWeight ? Math.round(((weightKg as number) * (bfpRounded / 100)) * 10) / 10 : null;
  const leanMassKg = hasWeight ? Math.round((((weightKg as number) - (fatMassKg as number)) * 10)) / 10 : null;

  return {
    ok: true,
    bfp: bfpRounded,
    category: classifyCategory(gender, bfpRounded),
    fatMassKg,
    leanMassKg,
  };
};

/** Convenience: accepts string inputs (from form state). */
export const computeBodyFatFromStrings = (input: InputStrings): BodyFatResult => {
  const nums: InputNumbers = {
    gender: input.gender,
    unit: input.unit,
    height: parseNumLoose(input.height),
    neck: parseNumLoose(input.neck),
    waist: parseNumLoose(input.waist),
    hip: input.gender === "female" ? parseNumLoose(input.hip ?? "") : undefined,
    weightKg: parseNumLoose(input.weightKg ?? ""),
  };
  return computeBodyFatFromNumbers(nums);
};
