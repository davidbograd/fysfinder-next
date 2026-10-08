/**
 * Dynamic heading generation for location and specialty pages
 * Supports 3-tier system: No filters = classic H1, Single filter = unique H1, Multiple filters = classic H1 + H2
 */

export interface HeadingFilters {
  ydernummer?: boolean;
  handicap?: boolean;
  online?: boolean;
}

const ONLINE_H2 = "Tilbyder online behandling og konsultation";
const YDERNUMMER_H2 = "Tilbyder vederlagsfri fysioterapi & henvisning fra læge";

function countFilters(filters?: HeadingFilters): number {
  return (
    (filters?.ydernummer ? 1 : 0) +
    (filters?.handicap ? 1 : 0) +
    (filters?.online ? 1 : 0)
  );
}

export interface HeadingResult {
  h1: string;
  h2: string | null;
}

/**
 * A city's Danish preposition. `null` means the location reads correctly on its
 * own and must not be prefixed at all.
 */
export type LocationPreposition = "i" | "på" | null;

function getLocationPhrase(
  locationName: string,
  locationPreposition?: LocationPreposition
): string {
  if (locationPreposition === null) return locationName;
  const preposition = locationPreposition === "på" ? "på" : "i";
  return `${preposition} ${locationName}`;
}

/**
 * Generate dynamic H1 and H2 text based on location, specialty, and filters
 * Uses 3-tier system for optimal SEO and user experience
 */
export function generateHeadings(
  locationName: string,
  specialtyName?: string,
  filters?: HeadingFilters,
  locationPreposition?: LocationPreposition
): HeadingResult {
  const hasYdernummer = filters?.ydernummer;
  const hasHandicap = filters?.handicap;
  const hasOnline = filters?.online;
  const filterCount = countFilters(filters);
  const locationPhrase = getLocationPhrase(locationName, locationPreposition);

  // Base text components
  const specialtyText = specialtyName
    ? ` specialiseret i ${specialtyName.toLowerCase()}`
    : "";

  // 3-Tier Logic
  let h1: string;
  let h2: string | null = null;

  if (filterCount === 0) {
    h1 = `Find og sammenlign fysioterapeuter ${locationPhrase}${specialtyText}`;
  } else if (filterCount === 1) {
    // Single filter: Unique H1 for that specific filter
    if (hasYdernummer) {
      h1 = `Find fysioterapeuter med ydernummer ${locationPhrase}${specialtyText}`;
      h2 = YDERNUMMER_H2;
    } else if (hasOnline) {
      h1 = `Find fysioterapeuter med online fysioterapi ${locationPhrase}${specialtyText}`;
      h2 = ONLINE_H2;
    } else {
      // No H2 for handicap only
      h1 = `Find fysioterapeuter med handicapadgang ${locationPhrase}${specialtyText}`;
      h2 = null;
    }
  } else {
    // Multiple filters: Classic H1 + descriptive H2
    h1 = `Find og sammenlign fysioterapeuter ${locationPhrase}${specialtyText}`;

    const filterTexts: string[] = [];
    if (hasYdernummer) filterTexts.push(YDERNUMMER_H2);
    if (hasHandicap) filterTexts.push("Har handicapadgang");
    if (hasOnline) filterTexts.push(ONLINE_H2);
    h2 = filterTexts.join(" · ");
  }

  return { h1, h2 };
}

/**
 * Generate meta title for location and specialty pages with filters
 * Uses optimized strategy for SEO and character count
 *
 * @param locationName - The name of the location (city, region, etc.)
 * @param specialtyName - Optional specialty name for specialty pages
 * @param filters - Optional filters (ydernummer, handicap, online)
 * @param clinicCount - Optional number of clinics (used for location-only pages with 2+ clinics)
 */
export function generateMetaTitle(
  locationName: string,
  specialtyName?: string,
  filters?: HeadingFilters,
  clinicCount?: number,
  locationPreposition?: LocationPreposition
): string {
  const hasYdernummer = filters?.ydernummer;
  const hasHandicap = filters?.handicap;
  const hasOnline = filters?.online;
  const filterCount = countFilters(filters);
  const locationPhrase = getLocationPhrase(locationName, locationPreposition);

  // Base text components
  const specialtyPrefix = specialtyName ? `${specialtyName} ` : "";

  if (filterCount === 0) {
    // No filters
    if (specialtyName) {
      return `${specialtyPrefix}fysioterapi ${locationPhrase} | Find fysioterapeuter ›`;
    } else {
      // Add clinic count to title when 2+ clinics and no filters/specialty
      // This creates titles like "15 fysioterapi klinikker i København | Find fysioterapeuter"
      if (clinicCount && clinicCount >= 2) {
        // For Danmark page, show "1000+" when we hit the limit
        const countDisplay =
          locationName.toLowerCase() === "danmark" && clinicCount >= 1000
            ? "1000+"
            : clinicCount.toString();
        return `${countDisplay} fysioterapi klinikker ${locationPhrase} | Find fysioterapeuter`;
      } else {
        return `Fysioterapi klinikker ${locationPhrase} | Find fysioterapeuter ›`;
      }
    }
  } else if (filterCount === 1) {
    // Single filter
    if (hasYdernummer) {
      if (specialtyName) {
        return `${specialtyPrefix}fysioterapi ${locationPhrase} | Ydernummer (vederlagsfri)`;
      } else {
        return `Find fysioterapeuter med ydernummer ${locationPhrase} →`;
      }
    } else if (hasOnline) {
      if (specialtyName) {
        return `Find online ${specialtyName.toLowerCase()} fysioterapi ${locationPhrase} →`;
      } else {
        return `Find fysioterapeuter med online fysioterapi ${locationPhrase} →`;
      }
    } else {
      // hasHandicap must be true since filterCount === 1
      if (specialtyName) {
        return `${specialtyPrefix}fysioterapeuter med handicapadgang ${locationPhrase}`;
      } else {
        return `Fysioterapeuter med handicapadgang ${locationPhrase}`;
      }
    }
  } else {
    // Multiple filters
    if (hasOnline) {
      const labels = [
        hasYdernummer && "ydernummer",
        hasHandicap && "handicapadgang",
        "online",
      ].filter(Boolean) as string[];
      const label = labels.join(" & ");
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      return specialtyName
        ? `${specialtyPrefix}fysioterapi ${locationPhrase} | ${capitalizedLabel}`
        : `Fysioterapeuter ${locationPhrase} | ${capitalizedLabel}`;
    }
    if (specialtyName) {
      return `${specialtyPrefix}fysioterapi ${locationPhrase} | Med ydernummer`;
    } else {
      return `Fysioterapeuter ${locationPhrase} | Ydernummer & handicapadgang`;
    }
  }
}

/**
 * Generate heading for location-only pages (convenience function)
 */
export function generateLocationHeading(
  locationName: string,
  filters?: HeadingFilters,
  locationPreposition?: LocationPreposition
): HeadingResult {
  return generateHeadings(
    locationName,
    undefined,
    filters,
    locationPreposition
  );
}

/**
 * Generate heading for location + specialty pages (convenience function)
 */
export function generateSpecialtyHeading(
  locationName: string,
  specialtyName: string,
  filters?: HeadingFilters,
  locationPreposition?: LocationPreposition
): HeadingResult {
  return generateHeadings(
    locationName,
    specialtyName,
    filters,
    locationPreposition
  );
}

/**
 * Generate meta title for location-only pages (convenience function)
 */
export function generateLocationMetaTitle(
  locationName: string,
  filters?: HeadingFilters,
  clinicCount?: number,
  locationPreposition?: LocationPreposition
): string {
  return generateMetaTitle(
    locationName,
    undefined,
    filters,
    clinicCount,
    locationPreposition
  );
}

/**
 * Generate meta title for location + specialty pages (convenience function)
 */
export function generateSpecialtyMetaTitle(
  locationName: string,
  specialtyName: string,
  filters?: HeadingFilters,
  clinicCount?: number,
  locationPreposition?: LocationPreposition
): string {
  return generateMetaTitle(
    locationName,
    specialtyName,
    filters,
    clinicCount,
    locationPreposition
  );
}
