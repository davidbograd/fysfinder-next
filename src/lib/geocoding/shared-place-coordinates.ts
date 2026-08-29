/**
 * Helpers for clinics that share one Google Place ID across different addresses.
 * Shared listings are allowed; map coordinates must still come from each clinic address.
 */

export interface ClinicCoordinateCandidate {
  clinics_id: string;
  google_place_id: string | null;
  postnummer: number | string | null;
  adresse?: string | null;
  lokation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export function normalizeClinicPostnummer(
  value: number | string | null | undefined
): string | null {
  if (value === null || value === undefined) return null;
  const digits = String(value).replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

/**
 * Returns every clinic that shares a Place ID with at least one other clinic
 * on a different postnummer. Place IDs stay attached; only coordinates need repair.
 */
export function selectClinicsSharingPlaceIdAcrossPostcodes<
  T extends ClinicCoordinateCandidate,
>(clinics: T[]): T[] {
  const byPlaceId = new Map<string, T[]>();

  for (const clinic of clinics) {
    const placeId = clinic.google_place_id?.trim();
    if (!placeId) continue;
    const group = byPlaceId.get(placeId) ?? [];
    group.push(clinic);
    byPlaceId.set(placeId, group);
  }

  const selected: T[] = [];

  for (const group of byPlaceId.values()) {
    if (group.length < 2) continue;

    const postcodes = new Set(
      group.map((clinic) => normalizeClinicPostnummer(clinic.postnummer)).filter(Boolean)
    );
    if (postcodes.size < 2) continue;

    selected.push(...group);
  }

  return selected;
}
