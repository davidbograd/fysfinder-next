// Delbare billeder fra FTP- og watt pr. kg-beregneren.
//
// Watt pr. kg-billedet viser kun W/kg og niveauet – aldrig vægten eller FTP,
// som sammen ville afsløre vægten.

import type { Gender } from "@/lib/bodyFat";
import {
  buildFtpZones,
  FtpSuccess,
  FtpZone,
  MAX_INPUT_WATTS,
  PowerSource,
} from "@/lib/calculators/ftp";
import {
  buildWattBands,
  WattBand,
  wattLevelFor,
  WattPerKgSuccess,
} from "@/lib/calculators/watt-per-kg";

export const FTP_SHARE_PATH = "/api/og/ftp";
export const WATT_PER_KG_SHARE_PATH = "/api/og/watt-pr-kg";

export interface FtpShareContent {
  ftp: number;
  source: PowerSource;
  zones: FtpZone[];
}

export interface WattPerKgShareContent {
  wattsPerKg: number;
  gender: Gender;
  level: string;
  bands: WattBand[];
}

export function buildFtpShareUrl(result: FtpSuccess): string {
  const params = new URLSearchParams({
    ftp: String(result.ftp),
    test: result.source,
  });
  return `${FTP_SHARE_PATH}?${params.toString()}`;
}

export function parseFtpShareParams(
  searchParams: URLSearchParams
): FtpShareContent | null {
  const rawFtp = searchParams.get("ftp") ?? "";
  const source = searchParams.get("test");
  if (!/^\d{1,4}$/.test(rawFtp)) return null;
  if (source !== "ftp" && source !== "test20" && source !== "ramp") return null;

  const ftp = Number(rawFtp);
  if (ftp < 20 || ftp > MAX_INPUT_WATTS) return null;
  return { ftp, source, zones: buildFtpZones(ftp) };
}

export function buildWattPerKgShareUrl(result: WattPerKgSuccess): string {
  const params = new URLSearchParams({
    wkg: result.wattsPerKg.toFixed(2),
    koen: result.profile.gender,
  });
  return `${WATT_PER_KG_SHARE_PATH}?${params.toString()}`;
}

export function parseWattPerKgShareParams(
  searchParams: URLSearchParams
): WattPerKgShareContent | null {
  const rawWkg = searchParams.get("wkg") ?? "";
  const gender = searchParams.get("koen");
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(rawWkg)) return null;
  if (gender !== "male" && gender !== "female") return null;

  const wattsPerKg = Number(rawWkg);
  if (wattsPerKg <= 0 || wattsPerKg > 40) return null;
  return {
    wattsPerKg,
    gender,
    level: wattLevelFor(gender, wattsPerKg),
    bands: buildWattBands(gender),
  };
}
