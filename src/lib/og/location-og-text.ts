// Copy for the per-location Open Graph images on /find/fysioterapeut/[location]/[specialty].
// Added: 2026-10-11

import type { LocationPreposition } from "@/lib/headers-and-metatitles";

/** Supabase caps the Danmark listing at 1000 rows, so a full page means "at least". */
const DANMARK_ROW_CAP = 1000;

export interface LocationOgTextInput {
  locationName: string;
  clinicCount: number;
  specialtyName?: string;
  locationPreposition?: LocationPreposition;
  isDanmark?: boolean;
}

export interface LocationOgText {
  headline: string;
  specialtyLine: string | null;
  /** Headline and specialty as one sentence, for the image alt text. */
  alt: string;
}

function locationPhrase(
  locationName: string,
  locationPreposition?: LocationPreposition
): string {
  if (locationPreposition === null) return locationName;
  return `${locationPreposition === "på" ? "på" : "i"} ${locationName}`;
}

/** "Knæ" → "knæ", but acronyms such as "KOL", "PTSD" and "SI-led" keep their casing. */
export function specialtyInSentence(specialtyName: string): string {
  if (/^\p{Lu}\p{Ll}/u.test(specialtyName)) {
    return specialtyName.charAt(0).toLowerCase() + specialtyName.slice(1);
  }
  return specialtyName;
}

export function buildLocationOgText({
  locationName,
  clinicCount,
  specialtyName,
  locationPreposition,
  isDanmark = false,
}: LocationOgTextInput): LocationOgText {
  const place = locationPhrase(locationName, isDanmark ? "i" : locationPreposition);
  const specialtyLine = specialtyName
    ? `med speciale i ${specialtyInSentence(specialtyName)}`
    : null;

  let headline: string;

  if (clinicCount === 0) {
    headline = isDanmark
      ? "Find fysioterapi i Danmark"
      : `Find fysioterapi nær ${locationName}`;
  } else if (clinicCount === 1) {
    headline = `Find din fysioterapeut ${place}`;
  } else {
    const count =
      isDanmark && clinicCount >= DANMARK_ROW_CAP
        ? `${DANMARK_ROW_CAP}+`
        : String(clinicCount);
    headline = `Sammenlign ${count} fysioterapiklinikker ${place}`;
  }

  return {
    headline,
    specialtyLine,
    alt: specialtyLine ? `${headline} ${specialtyLine}` : headline,
  };
}
