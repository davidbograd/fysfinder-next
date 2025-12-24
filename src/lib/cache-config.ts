/**
 * Centralized caching configuration for the application
 * 
 * This file defines all cache durations and tags used throughout the app.
 * Using consistent values ensures predictable behavior and easier maintenance.
 * 
 * Cache Strategy:
 * - Homepage: 6 hours (frequently visited, shows aggregated data)
 * - Location pages: 24 hours (relatively stable clinic data)
 * - Clinic pages: 24 hours (clinic info doesn't change often)
 * - Blog/Dictionary: 7 days (content rarely changes after publication)
 * - Search results: 1 hour (more dynamic, user-driven)
 */

export const CACHE_TIMES = {
  // Page-level cache durations (in seconds)
  HOMEPAGE: 6 * 60 * 60,        // 6 hours
  LOCATION_PAGE: 24 * 60 * 60,  // 24 hours
  CLINIC_PAGE: 24 * 60 * 60,    // 24 hours
  BLOG_POST: 7 * 24 * 60 * 60,  // 7 days
  DICTIONARY: 7 * 24 * 60 * 60, // 7 days
  SEARCH_RESULTS: 1 * 60 * 60,  // 1 hour
  SPECIALTIES: 7 * 24 * 60 * 60, // 7 days (rarely change)
  CITIES: 24 * 60 * 60,         // 24 hours
} as const;

/**
 * Cache tags for granular revalidation
 * 
 * Tags allow us to revalidate specific subsets of cached data.
 * For example, when a clinic updates, we can revalidate just that clinic's data
 * without clearing the entire cache.
 */
export const CACHE_TAGS = {
  // Aggregate tags for bulk revalidation
  ALL_CLINICS: 'clinics',
  ALL_CITIES: 'cities',
  ALL_SPECIALTIES: 'specialties',
  ALL_BLOG_POSTS: 'blog-posts',
  ALL_DICTIONARY: 'dictionary',
  
  // Factory functions for specific resource tags
  clinic: (clinicId: string) => `clinic-${clinicId}`,
  clinicBySlug: (slug: string) => `clinic-slug-${slug}`,
  city: (cityId: string) => `city-${cityId}`,
  cityBySlug: (slug: string) => `city-slug-${slug}`,
  specialty: (specialtyId: string) => `specialty-${specialtyId}`,
  blogPost: (slug: string) => `blog-${slug}`,
  dictionaryTerm: (slug: string) => `dictionary-${slug}`,
  
  // Location-based tags (for pages showing clinics in a specific location)
  clinicsInCity: (citySlug: string) => `clinics-in-${citySlug}`,
  clinicsWithSpecialty: (specialtySlug: string) => `clinics-specialty-${specialtySlug}`,
  clinicsInCityWithSpecialty: (citySlug: string, specialtySlug: string) => 
    `clinics-${citySlug}-${specialtySlug}`,
} as const;

/**
 * Helper function to build tags for a clinic page
 */
export function getClinicPageTags(clinicId: string, clinicSlug: string) {
  return [
    CACHE_TAGS.ALL_CLINICS,
    CACHE_TAGS.clinic(clinicId),
    CACHE_TAGS.clinicBySlug(clinicSlug),
  ];
}

/**
 * Helper function to build tags for a location page
 */
export function getLocationPageTags(citySlug: string, specialtySlug?: string) {
  const tags = [
    CACHE_TAGS.ALL_CLINICS,
    CACHE_TAGS.clinicsInCity(citySlug),
  ];
  
  if (specialtySlug) {
    tags.push(
      CACHE_TAGS.clinicsWithSpecialty(specialtySlug),
      CACHE_TAGS.clinicsInCityWithSpecialty(citySlug, specialtySlug)
    );
  }
  
  return tags;
}

/**
 * Helper function to build fetch options with caching
 */
export function getCacheFetchOptions(
  revalidateTime: number,
  tags?: string[]
) {
  return {
    next: {
      revalidate: revalidateTime,
      ...(tags && tags.length > 0 && { tags }),
    },
  };
}

