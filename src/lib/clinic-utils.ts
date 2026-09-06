// Shared clinic utility functions
// Created to eliminate duplicated specialty reordering logic across ClinicsList, NearbyClinicsList, and LocationPage

interface HasSpecialtySlug {
  specialty_name_slug: string;
}

/**
 * Reorders a clinic's specialties array to show the current specialty first.
 * Returns the original array unchanged if no currentSlug is provided.
 *
 * Always returns an array. RPC rows reach this with `specialties: null` when a clinic has no
 * specialties, and callers render the result directly.
 */
export function orderSpecialties<T extends HasSpecialtySlug>(
  specialties: T[] | null | undefined,
  currentSlug?: string
): T[] {
  if (!specialties) return [];
  if (!currentSlug) return specialties;
  return [
    ...specialties.filter((s) => s.specialty_name_slug === currentSlug),
    ...specialties.filter((s) => s.specialty_name_slug !== currentSlug),
  ];
}
