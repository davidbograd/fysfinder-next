// Server action: fetch the next page of location listing clinics.
// Updated: 2026-09-06 - Lets find pages ship the first 10 clinics in HTML only.

"use server";

import { Clinic } from "@/app/types";
import { LocationFilters } from "@/app/find/fysioterapeut/filter-utils";
import { fetchLocationData } from "@/app/find/fysioterapeut/[location]/fetch-location-data";
import { LOCATION_LIST_PAGE_SIZE } from "@/lib/location-listing";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

interface LoadMoreLocationClinicsInput {
  locationSlug: string;
  specialtySlug?: string;
  filters?: LocationFilters;
  offset: number;
}

export async function loadMoreLocationClinics({
  locationSlug,
  specialtySlug,
  filters,
  offset,
}: LoadMoreLocationClinicsInput): Promise<Clinic[]> {
  if (!SLUG_PATTERN.test(locationSlug)) return [];
  if (specialtySlug && !SLUG_PATTERN.test(specialtySlug)) return [];
  if (!Number.isInteger(offset) || offset < LOCATION_LIST_PAGE_SIZE) return [];

  const data = await fetchLocationData(locationSlug, specialtySlug, filters);
  return data.clinics.slice(offset, offset + LOCATION_LIST_PAGE_SIZE);
}
