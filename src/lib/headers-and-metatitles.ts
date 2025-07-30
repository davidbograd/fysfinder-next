/**
 * Dynamic heading generation for location and specialty pages
 * Supports 3-tier system: No filters = classic H1, Single filter = unique H1, Multiple filters = classic H1 + H2
 */

export interface HeadingFilters {
  ydernummer?: boolean;
  handicap?: boolean;
}

export interface HeadingResult {
  h1: string;
  h2: string | null;
}

/**
 * Generate dynamic H1 and H2 text based on location, specialty, and filters
 * Uses 3-tier system for optimal SEO and user experience
 */
export function generateHeadings(
  locationName: string,
  specialtyName?: string,
  filters?: HeadingFilters
): HeadingResult {
  const hasYdernummer = filters?.ydernummer;
  const hasHandicap = filters?.handicap;
  const filterCount = (hasYdernummer ? 1 : 0) + (hasHandicap ? 1 : 0);

  // Base text components
  const specialtyText = specialtyName
    ? ` specialiseret i ${specialtyName.toLowerCase()}`
    : "";

  // 3-Tier Logic
  let h1: string;
  let h2: string | null = null;

  if (filterCount === 0) {
    // No filters: Classic H1 only
    h1 = `Find og sammenlign fysioterapeuter ${locationName}${specialtyText}`;
  } else if (filterCount === 1) {
    // Single filter: Unique H1 for that specific filter
    if (hasYdernummer) {
      h1 = `Find fysioterapeuter ${locationName}${specialtyText} med ydernummer`;
      h2 = "Tilbyder vederlagsfri fysioterapi & henvisning fra læge";
    } else {
      // hasHandicap must be true since filterCount === 1 - no H2 for handicap only
      h1 = `Find fysioterapeuter ${locationName}${specialtyText} med handicapadgang`;
      h2 = null;
    }
  } else {
    // Multiple filters: Classic H1 + descriptive H2
    h1 = `Find og sammenlign fysioterapeuter ${locationName}${specialtyText}`;

    const filterTexts: string[] = [];
    if (hasYdernummer)
      filterTexts.push(
        "Tilbyder vederlagsfri fysioterapi & henvisning fra læge"
      );
    if (hasHandicap) filterTexts.push("Har handicapadgang");
    h2 = filterTexts.join(" · ");
  }

  return { h1, h2 };
}

/**
 * Generate meta title for location and specialty pages with filters
 * Uses optimized strategy for SEO and character count
 */
export function generateMetaTitle(
  locationName: string,
  specialtyName?: string,
  filters?: HeadingFilters
): string {
  const hasYdernummer = filters?.ydernummer;
  const hasHandicap = filters?.handicap;
  const filterCount = (hasYdernummer ? 1 : 0) + (hasHandicap ? 1 : 0);

  // Base text components
  const specialtyPrefix = specialtyName ? `${specialtyName} ` : "";

  if (filterCount === 0) {
    // No filters
    if (specialtyName) {
      return `${specialtyPrefix}fysioterapi i ${locationName} | Find fysioterapeuter ›`;
    } else {
      return `Fysioterapi klinikker i ${locationName} | Find fysioterapeuter ›`;
    }
  } else if (filterCount === 1) {
    // Single filter
    if (hasYdernummer) {
      if (specialtyName) {
        return `${specialtyPrefix}fysioterapi i ${locationName} | Ydernummer (vederlagsfri)`;
      } else {
        return `Fysioterapi ${locationName} | Ydernummer (vederlagsfri behandling)`;
      }
    } else {
      // hasHandicap must be true since filterCount === 1
      if (specialtyName) {
        return `${specialtyPrefix}fysioterapeuter med handicapadgang i ${locationName}`;
      } else {
        return `Fysioterapeuter med handicapadgang i ${locationName}`;
      }
    }
  } else {
    // Multiple filters
    if (specialtyName) {
      return `${specialtyPrefix}fysioterapi i ${locationName} | Med ydernummer`;
    } else {
      return `Fysioterapeuter i ${locationName} | Ydernummer & handicapadgang`;
    }
  }
}

/**
 * Generate heading for location-only pages (convenience function)
 */
export function generateLocationHeading(
  locationName: string,
  filters?: HeadingFilters
): HeadingResult {
  return generateHeadings(locationName, undefined, filters);
}

/**
 * Generate heading for location + specialty pages (convenience function)
 */
export function generateSpecialtyHeading(
  locationName: string,
  specialtyName: string,
  filters?: HeadingFilters
): HeadingResult {
  return generateHeadings(locationName, specialtyName, filters);
}

/**
 * Generate meta title for location-only pages (convenience function)
 */
export function generateLocationMetaTitle(
  locationName: string,
  filters?: HeadingFilters
): string {
  return generateMetaTitle(locationName, undefined, filters);
}

/**
 * Generate meta title for location + specialty pages (convenience function)
 */
export function generateSpecialtyMetaTitle(
  locationName: string,
  specialtyName: string,
  filters?: HeadingFilters
): string {
  return generateMetaTitle(locationName, specialtyName, filters);
}
