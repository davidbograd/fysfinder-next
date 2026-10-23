// Download-billeder for de værktøjer, der deler det fælles story-layout.
//
// Linket bærer kun de tal, billedet viser – aldrig vægt, højde eller andre
// input, som ikke står på billedet. Teksten formateres og valideres på
// serveren, så linket ikke kan bruges til at skrive vilkårlig tekst.

import type { Gender } from "@/lib/bodyFat";
import { BODY_FAT_BANDS, classifyCategory } from "@/lib/bodyFat";
import { describeBand, findBand, type ToolBand } from "@/lib/calculators/bands";
import { BMI_BANDS, bmiCategory } from "@/lib/calculators/bmi";
import {
  addDays,
  formatDanishDateRange,
  formatDanishDayMonth,
  parseIsoDate,
  toIsoDate,
} from "@/lib/calculators/dates";
import {
  MAX_BODY_AGE,
  MIN_BODY_AGE,
  type FitnessAgeSuccess,
} from "@/lib/calculators/fitness-age";
import { formatCompact, formatDecimal, formatInteger } from "@/lib/calculators/format";
import type { AdultHeightSuccess } from "@/lib/calculators/adult-height";
import {
  buildKonditalBandsForGroup,
  KONDITAL_AGE_GROUP_COUNT,
  konditalAgeGroupIndex,
  type KonditalSuccess,
} from "@/lib/calculators/kondital";
import type { MuscleMassSuccess } from "@/lib/calculators/muscle-mass";
import {
  FERTILE_DAYS_BEFORE_OVULATION,
  PEAK_DAYS_BEFORE_OVULATION,
  type OvulationSuccess,
} from "@/lib/calculators/ovulation";
import type { ProteinSuccess } from "@/lib/calculators/protein";
import type { RestingMetabolicRateSuccess } from "@/lib/calculators/resting-metabolic-rate";

export const TOOL_SHARE_PATH = "/api/og/resultat";

export type ToolShareIcon =
  | "gauge"
  | "personStanding"
  | "dumbbell"
  | "utensils"
  | "flame"
  | "beef"
  | "heartPulse"
  | "hourglass"
  | "ruler"
  | "calendarHeart"
  | "timer"
  | "weight";

export interface ToolShareRow {
  name: string;
  value: string;
  highlighted?: boolean;
}

export interface ToolShareFigure {
  label: string;
  heightCm: number;
  highlighted?: boolean;
}

export interface ToolShareCard {
  icon: ToolShareIcon;
  label: string;
  value: string;
  caption?: string;
  badge?: string;
  panelTitle?: string;
  rows?: ToolShareRow[];
  /** Personer tegnet i højde-skala; den fremhævede får en stiplet linje hen over de andre. */
  figures?: ToolShareFigure[];
}

type ShareValues = Record<string, string | number>;
type Parser = (params: URLSearchParams) => ToolShareCard | null;

function shareUrl(tool: ToolShareTool, values: ShareValues): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    params.set(key, String(value));
  }
  return `${TOOL_SHARE_PATH}/${tool}?${params.toString()}`;
}

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function readNumber(
  params: URLSearchParams,
  key: string,
  min: number,
  max: number,
  decimals = 0
): number | null {
  const raw = params.get(key);
  if (raw === null) return null;
  const pattern = decimals
    ? new RegExp(`^-?\\d{1,5}(\\.\\d{1,${decimals}})?$`)
    : /^-?\d{1,6}$/;
  if (!pattern.test(raw)) return null;
  const value = Number(raw);
  return value >= min && value <= max ? value : null;
}

function readGender(params: URLSearchParams): Gender | null {
  const gender = params.get("koen");
  return gender === "male" || gender === "female" ? gender : null;
}

function readDate(params: URLSearchParams, key: string): Date | null {
  const raw = params.get(key);
  if (!raw) return null;
  const date = parseIsoDate(raw);
  if (!date) return null;
  const year = date.getUTCFullYear();
  return year >= 2000 && year <= 2100 ? date : null;
}

function bandRows(bands: readonly ToolBand[], current: string | undefined): ToolShareRow[] {
  return bands.map((band) => ({
    name: band.label,
    value: describeBand(band),
    highlighted: band.label === current,
  }));
}

// BMI

export function buildBmiShareUrl(bmi: number): string {
  return shareUrl("bmi", { bmi: round(bmi, 1) });
}

const parseBmi: Parser = (params) => {
  const bmi = readNumber(params, "bmi", 5, 100, 1);
  if (bmi === null) return null;
  const category = bmiCategory(bmi);
  return {
    icon: "gauge",
    label: "Mit BMI",
    value: formatDecimal(bmi),
    badge: category,
    panelTitle: "BMI-kategorier",
    rows: bandRows(BMI_BANDS, category),
  };
};

// Fedtprocent

export function buildBodyFatShareUrl(bodyFatPct: number, gender: Gender): string {
  return shareUrl("fedtprocent", { fedt: round(bodyFatPct, 1), koen: gender });
}

const parseBodyFat: Parser = (params) => {
  const bfp = readNumber(params, "fedt", 1, 75, 1);
  const gender = readGender(params);
  if (bfp === null || !gender) return null;
  const category = classifyCategory(gender, bfp);
  return {
    icon: "personStanding",
    label: "Min fedtprocent",
    value: `${formatDecimal(bfp)} %`,
    badge: category,
    panelTitle: `Kategorier for ${gender === "male" ? "mænd" : "kvinder"}`,
    rows: bandRows(BODY_FAT_BANDS[gender], category),
  };
};

// Muskelmasse

export function buildMuscleMassShareUrl(result: MuscleMassSuccess): string {
  const values: ShareValues = {
    kg: round(result.muscleMassKg, 1),
    andel: round(result.muscleSharePct, 1),
    indeks: round(result.muscleIndex, 1),
  };
  if (result.bodyFatPct !== null) values.fedt = round(result.bodyFatPct, 1);
  return shareUrl("muskelmasse", values);
}

const parseMuscleMass: Parser = (params) => {
  const kg = readNumber(params, "kg", 5, 150, 1);
  const share = readNumber(params, "andel", 5, 80, 1);
  const index = readNumber(params, "indeks", 2, 40, 1);
  if (kg === null || share === null || index === null) return null;
  const bodyFat = readNumber(params, "fedt", 1, 75, 1);
  return {
    icon: "dumbbell",
    label: "Min estimerede muskelmasse",
    value: `${formatDecimal(kg)} kg`,
    caption: `${formatDecimal(share)} % af kropsvægten`,
    panelTitle: "Mine tal",
    rows: [
      { name: "Muskelindeks", value: `${formatDecimal(index)} kg/m²` },
      ...(bodyFat !== null
        ? [{ name: "Fedtprocent", value: `${formatDecimal(bodyFat)} %` }]
        : []),
    ],
  };
};

// Kalorieberegner

export function buildCalorieShareUrl(
  result: { bmr: number; tdee: number; weightGain: number },
  weeklyLossKg: string,
  lossKcal: number
): string {
  return shareUrl("kalorie", {
    tdee: result.tdee,
    bmr: result.bmr,
    tab: weeklyLossKg,
    tabkcal: lossKcal,
    op: result.weightGain,
  });
}

const LOSS_RATES = ["0.25", "0.5", "0.75", "1"];

const parseCalorie: Parser = (params) => {
  const tdee = readNumber(params, "tdee", 500, 10000);
  const bmr = readNumber(params, "bmr", 500, 10000);
  const lossKcal = readNumber(params, "tabkcal", -5000, 10000);
  const gain = readNumber(params, "op", 500, 10000);
  const rate = params.get("tab");
  if (tdee === null || bmr === null || lossKcal === null || gain === null) return null;
  if (!rate || !LOSS_RATES.includes(rate)) return null;
  return {
    icon: "utensils",
    label: "Mit daglige kaloriebehov",
    value: `${formatInteger(tdee)} kcal`,
    caption: "For at holde min vægt",
    panelTitle: "Mine kaloriemål",
    rows: [
      { name: "Grundstofskifte", value: `${formatInteger(bmr)} kcal` },
      {
        name: `Vægttab (${formatCompact(Number(rate), 2)} kg/uge)`,
        value: `${formatInteger(lossKcal)} kcal`,
      },
      { name: "Vægtøgning", value: `${formatInteger(gain)} kcal` },
    ],
  };
};

// Hvilestofskifte

export function buildRestingMetabolicRateShareUrl(
  result: RestingMetabolicRateSuccess
): string {
  return shareUrl("hvilestofskifte", {
    kcal: result.kcalPerDay,
    kj: result.kjPerDay,
    time: round(result.kcalPerHour),
  });
}

const parseRestingMetabolicRate: Parser = (params) => {
  const kcal = readNumber(params, "kcal", 500, 6000);
  const kj = readNumber(params, "kj", 2000, 25000);
  const perHour = readNumber(params, "time", 10, 300);
  if (kcal === null || kj === null || perHour === null) return null;
  return {
    icon: "flame",
    label: "Mit hvilestofskifte",
    value: `${formatInteger(kcal)} kcal`,
    caption: "Om dagen i hvile",
    panelTitle: "Det svarer til",
    rows: [
      { name: "I kilojoule", value: `${formatInteger(kj)} kJ` },
      { name: "Pr. time", value: `${formatInteger(perHour)} kcal` },
    ],
  };
};

// Protein

export function buildProteinShareUrl(result: ProteinSuccess): string {
  return shareUrl("protein", {
    g: result.gramsPerDayTarget,
    lav: result.gramsPerDayLow,
    hoej: result.gramsPerDayHigh,
    maaltider: result.mealsPerDay,
    pr: result.gramsPerMeal,
  });
}

const parseProtein: Parser = (params) => {
  const target = readNumber(params, "g", 10, 600);
  const low = readNumber(params, "lav", 10, 600);
  const high = readNumber(params, "hoej", 10, 600);
  const meals = readNumber(params, "maaltider", 1, 10);
  const perMeal = readNumber(params, "pr", 1, 600);
  if (target === null || low === null || high === null || meals === null || perMeal === null) {
    return null;
  }
  return {
    icon: "beef",
    label: "Mit daglige proteinbehov",
    value: `${formatInteger(target)} g`,
    caption: `Anbefalet: ${formatInteger(low)}–${formatInteger(high)} g om dagen`,
    panelTitle: "Fordelt på måltider",
    rows: [{ name: `${meals} måltider om dagen`, value: `${formatInteger(perMeal)} g pr. måltid` }],
  };
};

// Kondital

export function buildKonditalShareUrl(result: KonditalSuccess): string {
  return shareUrl("kondital", {
    vo2: round(result.kondital, 1),
    koen: result.profile.gender,
    gruppe: konditalAgeGroupIndex(result.profile.age),
  });
}

const parseKondital: Parser = (params) => {
  const vo2 = readNumber(params, "vo2", 5, 100, 1);
  const gender = readGender(params);
  const group = readNumber(params, "gruppe", 0, KONDITAL_AGE_GROUP_COUNT - 1);
  if (vo2 === null || !gender || group === null) return null;
  const { ageGroupLabel, bands } = buildKonditalBandsForGroup(gender, group);
  const level = findBand(bands, vo2);
  return {
    icon: "heartPulse",
    label: "Mit kondital",
    value: formatDecimal(vo2),
    badge: level.label,
    caption: "ml ilt pr. kg pr. minut",
    panelTitle: `${gender === "male" ? "Mænd" : "Kvinder"}, ${ageGroupLabel.toLowerCase()}`,
    rows: bandRows([...bands].reverse(), level.label),
  };
};

// Kropsalder

export function buildBodyAgeShareUrl(result: FitnessAgeSuccess): string {
  return shareUrl("kropsalder", {
    alder: result.bodyAge,
    forskel: result.difference,
    vo2: round(result.estimatedVo2, 1),
    snit: round(result.averageVo2ForAge, 1),
  });
}

function describeDifference(difference: number): string {
  if (difference === 0) return "Samme som min alder";
  const years = Math.abs(difference);
  return difference < 0 ? `${years} år yngre end min alder` : `${years} år ældre end min alder`;
}

const parseBodyAge: Parser = (params) => {
  const bodyAge = readNumber(params, "alder", MIN_BODY_AGE, MAX_BODY_AGE);
  const difference = readNumber(params, "forskel", -100, 100);
  const vo2 = readNumber(params, "vo2", 5, 100, 1);
  const average = readNumber(params, "snit", 5, 100, 1);
  if (bodyAge === null || difference === null || vo2 === null || average === null) return null;
  return {
    icon: "hourglass",
    label: "Min kropsalder",
    value: `${bodyAge} år`,
    badge: describeDifference(difference),
    caption:
      bodyAge === MIN_BODY_AGE ? "eller yngre" : bodyAge === MAX_BODY_AGE ? "eller ældre" : undefined,
    panelTitle: "Mit kondital",
    rows: [
      { name: "Mit estimerede kondital", value: formatDecimal(vo2), highlighted: true },
      { name: "Gennemsnit for min alder", value: formatDecimal(average) },
    ],
  };
};

// Højdeberegner

export function buildAdultHeightShareUrl(result: AdultHeightSuccess): string {
  return shareUrl("hoejde", {
    cm: round(result.predictedHeightCm, 1),
    lav: round(result.rangeLowCm, 1),
    hoej: round(result.rangeHighCm, 1),
    barn: result.profile.sex === "boy" ? "dreng" : "pige",
    mor: round(result.profile.motherHeightCm, 1),
    far: round(result.profile.fatherHeightCm, 1),
  });
}

const parseAdultHeight: Parser = (params) => {
  const cm = readNumber(params, "cm", 100, 250, 1);
  const low = readNumber(params, "lav", 90, 250, 1);
  const high = readNumber(params, "hoej", 100, 260, 1);
  const mother = readNumber(params, "mor", 100, 250, 1);
  const father = readNumber(params, "far", 100, 250, 1);
  const child = params.get("barn");
  if (cm === null || low === null || high === null || low > cm || high < cm) return null;
  if (mother === null || father === null || (child !== "dreng" && child !== "pige")) return null;
  return {
    icon: "ruler",
    label: "Forventet sluthøjde",
    value: `${formatDecimal(cm)} cm`,
    caption: `Typisk mellem ${formatDecimal(low)} og ${formatDecimal(high)} cm`,
    figures: [
      { label: "Mor", heightCm: mother },
      { label: child === "dreng" ? "Dreng" : "Pige", heightCm: cm, highlighted: true },
      { label: "Far", heightCm: father },
    ],
  };
};

// Ægløsning

export function buildOvulationShareUrl(result: OvulationSuccess): string {
  return shareUrl("aegloesning", {
    aeg: toIsoDate(result.upcoming.ovulation),
    menst: toIsoDate(result.upcoming.nextPeriod),
  });
}

const parseOvulation: Parser = (params) => {
  const ovulation = readDate(params, "aeg");
  const nextPeriod = readDate(params, "menst");
  if (!ovulation || !nextPeriod || nextPeriod.getTime() <= ovulation.getTime()) return null;
  return {
    icon: "calendarHeart",
    label: "Min næste ægløsning",
    value: formatDanishDayMonth(ovulation),
    panelTitle: "Min cyklus",
    rows: [
      {
        name: "Frugtbart vindue",
        value: formatDanishDateRange(addDays(ovulation, -FERTILE_DAYS_BEFORE_OVULATION), ovulation),
      },
      {
        name: "Mest frugtbare dage",
        value: formatDanishDateRange(addDays(ovulation, -PEAK_DAYS_BEFORE_OVULATION), ovulation),
        highlighted: true,
      },
      { name: "Næste menstruation", value: formatDanishDayMonth(nextPeriod) },
    ],
  };
};

// Pace

export type PaceShareKind = "loeb" | "plan";

export function buildPaceShareUrl(kind: PaceShareKind, distanceKm: number, totalSeconds: number): string {
  return shareUrl("pace", { type: kind, km: round(distanceKm, 3), tid: Math.round(totalSeconds) });
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mmss = `${String(minutes).padStart(hours ? 2 : 1, "0")}:${String(seconds).padStart(2, "0")}`;
  return hours ? `${hours}:${mmss}` : mmss;
}

const parsePace: Parser = (params) => {
  const kind = params.get("type");
  const km = readNumber(params, "km", 0.1, 1000, 3);
  const seconds = readNumber(params, "tid", 1, 60 * 60 * 100);
  if ((kind !== "loeb" && kind !== "plan") || km === null || seconds === null) return null;
  const secPerKm = Math.round(seconds / km);
  return {
    icon: "timer",
    label: kind === "loeb" ? "Mit løb" : "Min løbeplan",
    value: `${formatDuration(secPerKm)} /km`,
    caption: `${formatCompact(km, 2)} km på ${formatDuration(seconds)}`,
    panelTitle: kind === "loeb" ? "Mit tempo" : "Mit mål",
    rows: [
      { name: "Hastighed", value: `${formatDecimal((km / seconds) * 3600, 2)} km/t` },
      { name: kind === "loeb" ? "Tid" : "Forventet tid", value: formatDuration(seconds) },
    ],
  };
};

// RM

const RM_SHARE_PERCENTAGES: Record<number, number> = { 1: 100, 3: 93, 5: 87, 8: 80, 10: 75 };

export function buildRmShareUrl(oneRm: number): string {
  return shareUrl("rm", { kg: round(oneRm, 1) });
}

const parseRm: Parser = (params) => {
  const oneRm = readNumber(params, "kg", 1, 1000, 1);
  if (oneRm === null) return null;
  return {
    icon: "weight",
    label: "Min estimerede 1RM",
    value: `${formatCompact(oneRm)} kg`,
    panelTitle: "Mine RM-vægte",
    rows: Object.entries(RM_SHARE_PERCENTAGES).map(([reps, pct]) => ({
      name: `${reps} RM`,
      value: `${formatCompact(round((oneRm * pct) / 100, 1))} kg`,
      highlighted: reps === "1",
    })),
  };
};

const PARSERS = {
  bmi: parseBmi,
  fedtprocent: parseBodyFat,
  muskelmasse: parseMuscleMass,
  kalorie: parseCalorie,
  hvilestofskifte: parseRestingMetabolicRate,
  protein: parseProtein,
  kondital: parseKondital,
  kropsalder: parseBodyAge,
  hoejde: parseAdultHeight,
  aegloesning: parseOvulation,
  pace: parsePace,
  rm: parseRm,
} satisfies Record<string, Parser>;

export type ToolShareTool = keyof typeof PARSERS;

export function parseToolShareParams(tool: string, params: URLSearchParams): ToolShareCard | null {
  if (!Object.hasOwn(PARSERS, tool)) return null;
  return PARSERS[tool as ToolShareTool](params);
}
