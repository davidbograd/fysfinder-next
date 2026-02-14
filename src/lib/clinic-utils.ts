// Shared clinic utility functions
// Created to eliminate duplicated specialty reordering logic across ClinicsList, NearbyClinicsList, and LocationPage

interface HasSpecialtySlug {
  specialty_name_slug: string;
}

/**
 * Reorders a clinic's specialties array to show the current specialty first.
 * Returns the original array unchanged if no currentSlug is provided.
 */
export function orderSpecialties<T extends HasSpecialtySlug>(
  specialties: T[],
  currentSlug?: string
): T[] {
  if (!currentSlug || !specialties) return specialties;
  return [
    ...specialties.filter((s) => s.specialty_name_slug === currentSlug),
    ...specialties.filter((s) => s.specialty_name_slug !== currentSlug),
  ];
}
