// Helpers for location listing payloads (list page size, JSON-LD cap, slim map markers).
// Updated: 2026-09-06 - Keep find pages from serializing every clinic to the client.

import { Clinic } from "@/app/types";

export const LOCATION_LIST_PAGE_SIZE = 10;
export const LOCATION_JSON_LD_ITEM_LIMIT = 20;
export const LOCATION_MAP_MARKER_LIMIT = 40;

export interface LocationMapClinic {
  clinics_id: string;
  klinikNavn: string;
  klinikNavnSlug: string;
  avgRating: number;
  ratingCount: number;
  adresse: string;
  postnummer: number;
  lokation: string;
  latitude?: number | null;
  longitude?: number | null;
  clinic_latitude?: number | null;
  clinic_longitude?: number | null;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function clinicHasMapCoordinates(clinic: {
  latitude?: number | null;
  longitude?: number | null;
  clinic_latitude?: number | null;
  clinic_longitude?: number | null;
}): boolean {
  const coordinatePairs: Array<[unknown, unknown]> = [
    [clinic.latitude, clinic.longitude],
    [clinic.clinic_latitude, clinic.clinic_longitude],
  ];

  for (const [latCandidate, lngCandidate] of coordinatePairs) {
    const latitude = toFiniteNumber(latCandidate);
    const longitude = toFiniteNumber(lngCandidate);
    if (latitude === null || longitude === null) continue;
    if (latitude < -90 || latitude > 90) continue;
    if (longitude < -180 || longitude > 180) continue;
    return true;
  }

  return false;
}

export function toLocationMapClinic(clinic: Clinic): LocationMapClinic {
  return {
    clinics_id: clinic.clinics_id,
    klinikNavn: clinic.klinikNavn,
    klinikNavnSlug: clinic.klinikNavnSlug,
    avgRating: clinic.avgRating,
    ratingCount: clinic.ratingCount,
    adresse: clinic.adresse,
    postnummer: clinic.postnummer,
    lokation: clinic.lokation,
    latitude: clinic.latitude,
    longitude: clinic.longitude,
    clinic_latitude: clinic.clinic_latitude,
    clinic_longitude: clinic.clinic_longitude,
  };
}

export function getLocationMapClinics(clinics: Clinic[]): LocationMapClinic[] {
  const markers: LocationMapClinic[] = [];

  for (const clinic of clinics) {
    if (markers.length >= LOCATION_MAP_MARKER_LIMIT) break;
    if (!clinicHasMapCoordinates(clinic)) continue;
    markers.push(toLocationMapClinic(clinic));
  }

  return markers;
}

export function getSpecialtyMatchCounts(
  clinics: Array<{
    specialties: Array<{ specialty_name_slug: string }>;
  }>,
  specialties: Array<{ specialty_id: string; specialty_name_slug: string }>
): Record<string, number> {
  return specialties.reduce<Record<string, number>>((counts, specialty) => {
    counts[specialty.specialty_id.toString()] = clinics.filter((clinic) =>
      clinic.specialties.some(
        (item) => item.specialty_name_slug === specialty.specialty_name_slug
      )
    ).length;
    return counts;
  }, {});
}
