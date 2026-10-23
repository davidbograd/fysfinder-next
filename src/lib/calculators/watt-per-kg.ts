// Fysfinder – watt pr. kg beregner
//
// Watt pr. kg er FTP (den effekt, man kan holde i ca. en time) delt med
// kropsvægten. Niveauerne er en forenklet udgave af Andrew Coggans power-profil
// for FTP. Kilderne trækker grænserne lidt forskelligt, så niveauet er en
// pejling, ikke en licensklasse.
//
// Kendes FTP ikke direkte, estimeres den fra en test på samme måde som i
// FTP-beregneren (./ftp), så de to værktøjer altid giver samme FTP.

import type { Gender } from "@/lib/bodyFat";
import { parseDecimal } from "./parse";
import {
  estimateFtp,
  INPUT_WATTS_ERROR,
  parseInputWatts,
  type PowerSource,
} from "./ftp";

export type { PowerSource } from "./ftp";

export const WATT_LEVELS = [
  "Utrænet",
  "Begynder",
  "Motionist",
  "Godt trænet",
  "Meget godt trænet",
  "Fremragende",
  "Eliteniveau",
  "Verdensklasse",
] as const;

/** Syv skillelinjer mellem de otte niveauer, i W/kg. */
const THRESHOLDS: Record<Gender, number[]> = {
  male: [2.0, 2.6, 3.2, 3.8, 4.4, 5.0, 5.7],
  female: [1.8, 2.3, 2.8, 3.3, 3.9, 4.4, 5.0],
};

export interface WattBand {
  label: string;
  /** null på det laveste niveau, som ingen bund har. */
  min: number | null;
  /** null på det højeste niveau, som intet loft har. */
  max: number | null;
}

export interface WattPerKgInput {
  source: PowerSource;
  gender: Gender | "";
  watts: string;
  weightKg: string;
}

export interface WattPerKgError {
  ok: false;
  message: string;
}

export interface WattPerKgSuccess {
  ok: true;
  ftpWatts: number;
  wattsPerKg: number;
  level: string;
  bands: WattBand[];
  /** null, når man allerede er på det højeste niveau. */
  nextLevel: {
    label: string;
    wattsPerKg: number;
    /** Ekstra watt ved samme vægt. */
    extraWatts: number;
    /** Kg lettere ved samme effekt. */
    lessKg: number;
  } | null;
  profile: {
    source: PowerSource;
    gender: Gender;
    watts: number;
    weightKg: number;
  };
}

export type WattPerKgResult = WattPerKgError | WattPerKgSuccess;

export function buildWattBands(gender: Gender): WattBand[] {
  const thresholds = THRESHOLDS[gender];
  return WATT_LEVELS.map((label, index) => ({
    label,
    min: index === 0 ? null : thresholds[index - 1],
    max: index === thresholds.length ? null : thresholds[index],
  }));
}

function levelIndex(gender: Gender, wattsPerKg: number): number {
  const index = THRESHOLDS[gender].findIndex((limit) => wattsPerKg < limit);
  return index === -1 ? WATT_LEVELS.length - 1 : index;
}

export function wattLevelFor(gender: Gender, wattsPerKg: number): string {
  return WATT_LEVELS[levelIndex(gender, wattsPerKg)];
}

export function computeWattPerKg(input: WattPerKgInput): WattPerKgResult {
  if (input.gender !== "male" && input.gender !== "female") {
    return {
      ok: false,
      message: "Vælg køn – niveauerne er forskellige for mænd og kvinder.",
    };
  }

  const watts = parseInputWatts(input.watts);
  if (watts === null) {
    return { ok: false, message: INPUT_WATTS_ERROR };
  }

  const weightKg = parseDecimal(input.weightKg);
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 200) {
    return { ok: false, message: "Indtast en vægt mellem 30 og 200 kg." };
  }

  const ftpWatts = estimateFtp(input.source, watts);
  const wattsPerKg = Math.round((ftpWatts / weightKg) * 100) / 100;
  const index = levelIndex(input.gender, wattsPerKg);
  const nextLimit = THRESHOLDS[input.gender][index];

  return {
    ok: true,
    ftpWatts,
    wattsPerKg,
    level: WATT_LEVELS[index],
    bands: buildWattBands(input.gender),
    nextLevel:
      nextLimit === undefined
        ? null
        : {
            label: WATT_LEVELS[index + 1],
            wattsPerKg: nextLimit,
            extraWatts: Math.max(1, Math.ceil(nextLimit * weightKg - ftpWatts)),
            lessKg: Math.max(
              0.1,
              Math.ceil((weightKg - ftpWatts / nextLimit) * 10) / 10
            ),
          },
    profile: { source: input.source, gender: input.gender, watts, weightKg },
  };
}
