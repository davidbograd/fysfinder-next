// Location listing data fetching shared by the find page and load-more action.
// Updated: 2026-09-06 - Extracted so pagination does not import the page module.

import { cache } from "react";
import {
  Clinic,
  City,
  ClinicWithDistance,
  DBClinicResponse,
  LocationPageData,
  NearbyCity,
  SpecialtyWithSeo,
} from "@/app/types/index";
import {
  getPrimaryRankingContext,
  getRankingPolicy,
  isPremiumListingActive,
  resolvePremiumListing,
  sortClinicsByPolicy,
} from "@/lib/clinic-entitlements";
import { CACHE_TIMES } from "@/lib/cache-config";
import { LocationFilters } from "@/app/find/fysioterapeut/filter-utils";

type FetchRetryOptions = RequestInit & {
  next?: {
    revalidate: number;
  };
};

interface NearbyClinicSpecialty {
  specialty_name: string;
}

interface NearbyClinicFilterable {
  clinic_specialties?: NearbyClinicSpecialty[];
}

interface NearbyRankingClinic extends ClinicWithDistance, NearbyClinicFilterable {}

async function fetchWithRetry(
  url: string,
  options: FetchRetryOptions,
  retries = 3,
  delay = 1000
): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

function isValidClinicResponse(data: unknown): data is DBClinicResponse {
  if (!data || typeof data !== "object") return false;
  const clinic = data as Partial<DBClinicResponse>;
  return (
    "clinics_id" in clinic &&
    "klinikNavn" in clinic &&
    "clinic_specialties" in clinic &&
    Array.isArray(clinic.clinic_specialties)
  );
}

function mapDBClinicToClinic(dbClinic: DBClinicResponse): Clinic {
  const clinic = {
    ...dbClinic,
    specialties: dbClinic.clinic_specialties.map((cs) => cs.specialty),
    team_members: dbClinic.clinic_team_members || [],
    insurances: dbClinic.clinic_insurances?.map((ci) => ci.insurance) || [],
    extraServices: dbClinic.clinic_services?.map((cs) => cs.service) || [],
    premium_listing: resolvePremiumListing(dbClinic.premium_listings),
  };
  return clinic;
}

function applyClinicFilters(url: string, filters?: LocationFilters): string {
  let nextUrl = url;
  if (filters?.ydernummer) nextUrl += "&ydernummer=eq.true";
  if (filters?.handicap) nextUrl += "&handicapadgang=eq.true";
  return nextUrl;
}

function mapValidClinics(clinicsData: unknown): Clinic[] {
  const validClinics = Array.isArray(clinicsData)
    ? clinicsData.filter(isValidClinicResponse)
    : [];
  return validClinics.map(mapDBClinicToClinic);
}

function filterNearbyClinicsBySpecialty<T extends NearbyClinicFilterable>(
  nearbyClinics: T[],
  specialties: SpecialtyWithSeo[],
  specialtySlug?: string
): T[] {
  if (!specialtySlug || nearbyClinics.length === 0) return nearbyClinics;

  const specialtyNameToSlug = new Map(
    specialties.map((specialty) => [
      specialty.specialty_name,
      specialty.specialty_name_slug,
    ])
  );

  return nearbyClinics.filter((clinic) => {
    if (!clinic.clinic_specialties || !Array.isArray(clinic.clinic_specialties))
      return false;

    return clinic.clinic_specialties.some((specialty) => {
      const specialtySlugFromName = specialtyNameToSlug.get(
        specialty.specialty_name
      );
      return specialtySlugFromName === specialtySlug;
    });
  });
}

interface LocationFetchContext {
  headers: Record<string, string>;
  fetchOptions: FetchRetryOptions;
  specialtiesUrl: string;
  locationSlug: string;
  specialtySlug?: string;
  filters?: LocationFilters;
  primaryRankingPolicy: ReturnType<typeof getRankingPolicy>;
  nearbyRankingPolicy: ReturnType<typeof getRankingPolicy>;
}

async function fetchDanmarkLocationData(
  context: LocationFetchContext
): Promise<LocationPageData> {
  const { specialtiesUrl, fetchOptions, specialtySlug, filters, primaryRankingPolicy } =
    context;

  let clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),premium_listings(id,start_date,end_date,booking_link)`;

  if (specialtySlug) {
    clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),premium_listings(id,start_date,end_date,booking_link),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`;
  }

  clinicsUrl = applyClinicFilters(clinicsUrl, filters);

  const [specialties, clinicsData] = await Promise.all([
    fetchWithRetry(specialtiesUrl, fetchOptions) as Promise<SpecialtyWithSeo[]>,
    fetchWithRetry(clinicsUrl, fetchOptions),
  ]);

  const clinics = mapValidClinics(clinicsData);

  return {
    city: null,
    clinics: sortClinicsByPolicy(clinics, primaryRankingPolicy),
    nearbyClinicsList: [],
    nearbyCities: [],
    specialties,
  };
}

async function fetchOnlineLocationData(
  context: LocationFetchContext
): Promise<LocationPageData> {
  const { specialtiesUrl, fetchOptions, specialtySlug, filters, primaryRankingPolicy } =
    context;

  let clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings(id,start_date,end_date,booking_link)`;
  const specialtyFilter = specialtySlug
    ? `&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`
    : "";

  if (specialtySlug) {
    clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings(id,start_date,end_date,booking_link),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))${specialtyFilter}`;
  }

  clinicsUrl += "&or=(lokationSlug.eq.online,online_fysioterapeut.eq.true)";
  clinicsUrl = applyClinicFilters(clinicsUrl, filters);

  const [specialties, cityDataResult, clinicsData] = await Promise.all([
    fetchWithRetry(specialtiesUrl, fetchOptions) as Promise<SpecialtyWithSeo[]>,
    (fetchWithRetry(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/cities?bynavn_slug=eq.online&select=*`,
      fetchOptions
    ) as Promise<City[]>).catch((error: unknown) => {
      console.warn("Could not fetch city data for 'online' location:", error);
      return null;
    }),
    fetchWithRetry(clinicsUrl, fetchOptions),
  ]);

  const cityForOnline = cityDataResult?.[0] || null;
  const finalCityObject: City =
    cityForOnline ||
    ({
      id: "online",
      bynavn: "Online",
      bynavn_slug: "online",
      location_preposition: "i",
      latitude: 0,
      longitude: 0,
      postal_codes: [],
      betegnelse: "Online fysioterapi",
      seo_tekst: undefined,
    } as City);

  const clinics = mapValidClinics(clinicsData);

  return {
    city: finalCityObject,
    clinics: sortClinicsByPolicy(clinics, primaryRankingPolicy),
    nearbyClinicsList: [],
    nearbyCities: [],
    specialties,
  };
}

async function fetchCityLocationData(
  context: LocationFetchContext
): Promise<LocationPageData> {
  const {
    headers,
    fetchOptions,
    specialtiesUrl,
    locationSlug,
    specialtySlug,
    filters,
    primaryRankingPolicy,
    nearbyRankingPolicy,
  } = context;

  const [specialties, cityData] = await Promise.all([
    fetchWithRetry(specialtiesUrl, fetchOptions) as Promise<SpecialtyWithSeo[]>,
    fetchWithRetry(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/cities?bynavn_slug=eq.${locationSlug}&select=*`,
      fetchOptions
    ) as Promise<City[]>,
  ]);

  const city = cityData[0] || null;
  if (!city)
    return {
      city: null,
      clinics: [],
      nearbyClinicsList: [],
      nearbyCities: [],
      specialties,
    };

  let clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings(id,start_date,end_date,booking_link)&city_id=eq.${city.id}`;
  if (specialtySlug) {
    clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings(id,start_date,end_date,booking_link),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))&city_id=eq.${city.id}&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`;
  }

  let premiumClinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings!inner(id,start_date,end_date,booking_link,premium_listing_locations!inner(city_id))&premium_listings.premium_listing_locations.city_id=eq.${city.id}`;
  if (specialtySlug) {
    premiumClinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings!inner(id,start_date,end_date,booking_link,premium_listing_locations!inner(city_id)),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))&premium_listings.premium_listing_locations.city_id=eq.${city.id}&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`;
  }

  clinicsUrl = applyClinicFilters(clinicsUrl, filters);
  premiumClinicsUrl = applyClinicFilters(premiumClinicsUrl, filters);

  const [clinicsData, premiumClinicsData, nearbyData, nearbyCitiesData] =
    await Promise.all([
      fetchWithRetry(clinicsUrl, fetchOptions),
      fetchWithRetry(premiumClinicsUrl, fetchOptions),
      fetchWithRetry(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/get_nearby_clinics`, {
        ...fetchOptions,
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_lat: city.latitude,
          origin_lng: city.longitude,
          max_distance_km: 10,
          exclude_city_id: city.id,
        }),
      }),
      // Reaches further than the clinic list: these are internal links, so one town
      // further out is still useful rather than misleading.
      fetchWithRetry(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/get_nearby_cities_with_clinics`,
        {
          ...fetchOptions,
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            origin_lat: city.latitude,
            origin_lng: city.longitude,
            max_distance_km: 20,
            exclude_city_id: city.id,
          }),
        }
      ).catch(() => []),
    ]);

  const clinics = mapValidClinics(clinicsData);
  const premiumClinics = mapValidClinics(premiumClinicsData).filter((clinic) =>
    isPremiumListingActive(clinic.premium_listing)
  );
  const allClinics = [
    ...premiumClinics,
    ...clinics.filter(
      (clinic) => !premiumClinics.some((premium) => premium.clinics_id === clinic.clinics_id)
    ),
  ];

  const nearbyClinics = Array.isArray(nearbyData)
    ? (nearbyData as NearbyRankingClinic[])
    : [];
  const nearbyClinicsList = filterNearbyClinicsBySpecialty(
    nearbyClinics,
    specialties,
    specialtySlug
  );

  return {
    city,
    clinics: sortClinicsByPolicy(allClinics, primaryRankingPolicy),
    nearbyClinicsList: sortClinicsByPolicy(nearbyClinicsList, nearbyRankingPolicy),
    nearbyCities: Array.isArray(nearbyCitiesData)
      ? (nearbyCitiesData as NearbyCity[])
      : [],
    specialties,
  };
}

async function fetchLocationDataUncached(
  locationSlug: string,
  specialtySlug?: string,
  filters?: LocationFilters
): Promise<LocationPageData> {
  const headers = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  };

  const fetchOptions = {
    headers,
    next: { revalidate: CACHE_TIMES.LOCATION_PAGE },
  };
  const primaryRankingPolicy = getRankingPolicy(
    getPrimaryRankingContext(locationSlug, specialtySlug)
  );
  const nearbyRankingPolicy = getRankingPolicy("nearby");

  try {
    const specialtiesUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/specialties?select=specialty_id,specialty_name,specialty_name_slug,seo_tekst`;

    const context: LocationFetchContext = {
      headers,
      fetchOptions,
      specialtiesUrl,
      locationSlug,
      specialtySlug,
      filters,
      primaryRankingPolicy,
      nearbyRankingPolicy,
    };

    if (locationSlug === "danmark") return fetchDanmarkLocationData(context);
    if (locationSlug === "online") return fetchOnlineLocationData(context);
    return fetchCityLocationData(context);
  } catch {
    return {
      city: null,
      clinics: [],
      nearbyClinicsList: [],
      nearbyCities: [],
      specialties: [],
    };
  }
}

const fetchLocationDataCached = cache(
  async (
    locationSlug: string,
    specialtySlug: string | undefined,
    ydernummer: boolean,
    handicap: boolean
  ): Promise<LocationPageData> => {
    const filters =
      ydernummer || handicap
        ? {
            ...(ydernummer ? { ydernummer: true } : {}),
            ...(handicap ? { handicap: true } : {}),
          }
        : undefined;

    return fetchLocationDataUncached(locationSlug, specialtySlug, filters);
  }
);

export async function fetchLocationData(
  locationSlug: string,
  specialtySlug?: string,
  filters?: { ydernummer?: boolean; handicap?: boolean }
): Promise<LocationPageData> {
  return fetchLocationDataCached(
    locationSlug,
    specialtySlug,
    Boolean(filters?.ydernummer),
    Boolean(filters?.handicap)
  );
}
