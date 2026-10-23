// Fysfinder – FTP-beregner
//
// FTP (Functional Threshold Power) estimeres fra en test, hvis den ikke kendes:
//   - 20-minutterstest: gennemsnitlig effekt x 0,95 (Allen & Coggan)
//   - Ramptest: bedste minut x 0,75 (som Zwift og TrainerRoad bruger)
// FTP afrundes til hele watt, og den afrundede værdi bruges overalt: resultat,
// wattzoner, kopieret tekst og watt pr. kg.
//
// Wattzonerne følger Coggans syv effektzoner. Z1–Z6 regnes om til hele watt
// uden overlap og huller: en zone starter ved den første hele watt, der når
// zonens procentgrænse. Z7 (neuromuskulær) har ingen FTP-grænse.

import { formatInteger } from "./format";
import { parseDecimal } from "./parse";

export type PowerSource = "ftp" | "test20" | "ramp";

export const FTP_FACTORS: Record<PowerSource, number> = {
  ftp: 1,
  test20: 0.95,
  ramp: 0.75,
};

export const MIN_INPUT_WATTS = 30;
export const MAX_INPUT_WATTS = 2000;

export function estimateFtp(source: PowerSource, watts: number): number {
  return Math.round(watts * FTP_FACTORS[source]);
}

export type FtpZoneId = "Z1" | "Z2" | "Z3" | "Z4" | "Z5" | "Z6" | "Z7";

export interface FtpZone {
  id: FtpZoneId;
  name: string;
  description: string;
  /** null på Z7, som ikke har et wattinterval. */
  min: number | null;
  /** null på Z6 (intet loft) og Z7. */
  max: number | null;
}

/** Procentgrænserne, hvor Z2–Z6 starter. */
const ZONE_STARTS = [0.55, 0.75, 0.9, 1.05, 1.2] as const;

const ZONE_TEXT: { id: FtpZoneId; name: string; description: string }[] = [
  { id: "Z1", name: "Aktiv restitution", description: "Meget let cykling og restitution." },
  { id: "Z2", name: "Udholdenhed", description: "Rolige, længerevarende cykelture." },
  {
    id: "Z3",
    name: "Tempo",
    description: "Kontrolleret cykling ved moderat til høj intensitet.",
  },
  { id: "Z4", name: "Tærskel", description: "Hård træning omkring din FTP." },
  { id: "Z5", name: "VO2max", description: "Hårde aerobe intervaller." },
  { id: "Z6", name: "Anaerob kapacitet", description: "Korte, meget hårde intervaller." },
  {
    id: "Z7",
    name: "Neuromuskulær effekt",
    description: "Meget korte sprint ved maksimal indsats.",
  },
];

/**
 * Zoner, der bliver tomme ved meget lav FTP (fordi to grænser runder op til
 * samme watt), udelades frem for at vise min > max.
 */
export function buildFtpZones(ftp: number): FtpZone[] {
  const starts = [0, ...ZONE_STARTS.map((pct) => Math.ceil(ftp * pct))];

  const wattZones = ZONE_TEXT.slice(0, 6).map((text, index) => ({
    ...text,
    min: starts[index],
    max: index === 5 ? null : starts[index + 1] - 1,
  }));

  return [
    ...wattZones.filter((zone) => zone.max === null || zone.min <= zone.max),
    { ...ZONE_TEXT[6], min: null, max: null },
  ];
}

export function formatZoneRange(zone: FtpZone): string {
  if (zone.min === null) return "Maksimal sprintindsats – individuelt";
  if (zone.max === null) return `Fra ${formatInteger(zone.min)} W`;
  return `${formatInteger(zone.min)}–${formatInteger(zone.max)} W`;
}

export interface FtpInput {
  source: PowerSource;
  watts: string;
}

export interface FtpError {
  ok: false;
  message: string;
}

export interface FtpSuccess {
  ok: true;
  source: PowerSource;
  inputWatts: number;
  ftp: number;
  zones: FtpZone[];
}

export type FtpResult = FtpError | FtpSuccess;

export function parseInputWatts(value: string): number | null {
  const watts = parseDecimal(value);
  if (!Number.isFinite(watts) || watts < MIN_INPUT_WATTS || watts > MAX_INPUT_WATTS) {
    return null;
  }
  return watts;
}

export const INPUT_WATTS_ERROR = "Indtast en effekt mellem 30 og 2.000 watt.";

export function computeFtp(input: FtpInput): FtpResult {
  const inputWatts = parseInputWatts(input.watts);
  if (inputWatts === null) {
    return { ok: false, message: INPUT_WATTS_ERROR };
  }

  const ftp = estimateFtp(input.source, inputWatts);
  return {
    ok: true,
    source: input.source,
    inputWatts,
    ftp,
    zones: buildFtpZones(ftp),
  };
}

const COPY_HEADING: Record<PowerSource, string> = {
  ftp: "Din FTP",
  test20: "Din estimerede FTP (20-minutterstest)",
  ramp: "Din estimerede FTP (ramptest)",
};

export function buildFtpCopyText(result: FtpSuccess): string {
  return [
    `${COPY_HEADING[result.source]}: ${formatInteger(result.ftp)} watt`,
    "",
    "Dine wattzoner til cykeltræning:",
    ...result.zones.map(
      (zone) =>
        `${zone.id} ${zone.name}: ${formatZoneRange(zone)} – ${zone.description}`
    ),
  ].join("\n");
}
