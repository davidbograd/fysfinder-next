// Fysfinder – hoejdeberegner (forventet sluthoejde)
//
// Midtforaeldre-metoden (Tanner): gennemsnittet af foraeldrenes hoejde,
// korrigeret 13 cm op for drenge og 13 cm ned for piger. Intervallet paa
// +/- 8,5 cm daekker omtrent to standardafvigelser, dvs. de fleste boern.

import { parseDecimal } from "./parse";

export type ChildSex = "boy" | "girl";

export interface AdultHeightInput {
  sex: ChildSex | "";
  motherHeightCm: string;
  fatherHeightCm: string;
}

export interface AdultHeightError {
  ok: false;
  message: string;
}

export interface AdultHeightSuccess {
  ok: true;
  predictedHeightCm: number;
  rangeLowCm: number;
  rangeHighCm: number;
  parentAverageCm: number;
  /** De tolkede input, så resultatet kan gentage, hvad der blev regnet på. */
  profile: {
    sex: ChildSex;
    motherHeightCm: number;
    fatherHeightCm: number;
  };
}

export type AdultHeightResult = AdultHeightError | AdultHeightSuccess;

export const SEX_ADJUSTMENT_CM = 13;
export const PREDICTION_MARGIN_CM = 8.5;

const MIN_PARENT_HEIGHT_CM = 120;
const MAX_PARENT_HEIGHT_CM = 230;

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function isValidParentHeight(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= MIN_PARENT_HEIGHT_CM &&
    value <= MAX_PARENT_HEIGHT_CM
  );
}

export function computeAdultHeight(
  input: AdultHeightInput
): AdultHeightResult {
  if (input.sex !== "boy" && input.sex !== "girl") {
    return { ok: false, message: "Vælg, om barnet er en dreng eller en pige." };
  }

  const motherHeight = parseDecimal(input.motherHeightCm);
  const fatherHeight = parseDecimal(input.fatherHeightCm);

  if (!isValidParentHeight(motherHeight) || !isValidParentHeight(fatherHeight)) {
    return {
      ok: false,
      message: `Indtast begge forældres højde i cm (mellem ${MIN_PARENT_HEIGHT_CM} og ${MAX_PARENT_HEIGHT_CM}).`,
    };
  }

  const parentAverageCm = (motherHeight + fatherHeight) / 2;
  const adjustment =
    input.sex === "boy" ? SEX_ADJUSTMENT_CM / 2 : -SEX_ADJUSTMENT_CM / 2;
  const predictedHeightCm = parentAverageCm + adjustment;

  return {
    ok: true,
    predictedHeightCm: roundToOneDecimal(predictedHeightCm),
    rangeLowCm: roundToOneDecimal(predictedHeightCm - PREDICTION_MARGIN_CM),
    rangeHighCm: roundToOneDecimal(predictedHeightCm + PREDICTION_MARGIN_CM),
    parentAverageCm: roundToOneDecimal(parentAverageCm),
    profile: {
      sex: input.sex,
      motherHeightCm: roundToOneDecimal(motherHeight),
      fatherHeightCm: roundToOneDecimal(fatherHeight),
    },
  };
}
