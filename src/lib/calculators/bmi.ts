// Fysfinder – BMI-kategorier (WHO). Grænserne er "under", så 24,9 er normal og 25,0 overvægt.

import { findBand } from "./bands";

export const BMI_BANDS = [
  { label: "Undervægtig", min: null, max: 18.5 },
  { label: "Normal vægt", min: 18.5, max: 25 },
  { label: "Overvægtig", min: 25, max: 30 },
  { label: "Svært overvægtig", min: 30, max: null },
] as const;

export type BmiCategory = (typeof BMI_BANDS)[number]["label"];

export function bmiCategory(bmi: number): BmiCategory {
  return findBand(BMI_BANDS, bmi).label;
}
