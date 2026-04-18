// Location page - shared location rendering with city/specialty data fetching.
// Updated: uses centralized entitlement policies for premium/verified sorting behavior.

import { cache } from "react";
import ClinicListingCard from "@/components/features/clinic/ClinicListingCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { deslugify, slugify } from "@/app/utils/slugify";
import { Metadata } from "next";
import {
  Clinic,
  City,
  ClinicWithDistance,
  DBClinicResponse,
  LocationPageData,
  SpecialtyWithSeo,
} from "@/app/types/index";
import { notFound, redirect } from "next/navigation";

import { SpecialtiesList } from "@/components/features/specialty/SpecialtiesList";
import { ClinicsList } from "@/components/features/clinic/ClinicsList";
import { NoResultsFound } from "@/app/find/fysioterapeut/[location]/components/NoResultsFound";
import { NearbyClinicsList } from "@/app/find/fysioterapeut/[location]/components/NearbyClinicsList";
import { LocationClinicsMap } from "@/app/find/fysioterapeut/[location]/components/LocationClinicsMap";
import { LocationStructuredData } from "@/components/seo/LocationStructuredData";
import { SearchInterface } from "@/components/search/SearchInterface";
import { PartnershipBanner } from "@/components/features/partnership/PartnershipBanner";
import { SeoContent } from "@/components/seo/SeoContent";
import { orderSpecialties } from "@/lib/clinic-utils";
import { getRankingPolicy, sortClinicsByPolicy } from "@/lib/clinic-entitlements";

// Heading generation utility
import {
  generateHeadings,
  generateMetaTitle,
} from "@/lib/headers-and-metatitles";
import { CACHE_TIMES } from "@/lib/cache-config";
import { createStaticClient } from "@/app/utils/supabase/static";
import { LocationFilters, parseFilters } from "@/app/find/fysioterapeut/filter-utils";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

// Supabase client for static generation (no cookies, safe for ISR)
const supabase = createStaticClient();

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

/**
 * Type guard function to validate clinic data
 */
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

/**
 * Maps a database clinic response to our Clinic type
 */
function mapDBClinicToClinic(dbClinic: DBClinicResponse): Clinic {
  const clinic = {
    ...dbClinic,
    specialties: dbClinic.clinic_specialties.map((cs) => cs.specialty),
    team_members: dbClinic.clinic_team_members || [],
    insurances: dbClinic.clinic_insurances?.map((ci) => ci.insurance) || [],
    extraServices: dbClinic.clinic_services?.map((cs) => cs.service) || [],
    premium_listing: dbClinic.premium_listings?.[0] || null,
  };
  return clinic;
}

function getPrimaryRankingContext(
  locationSlug: string,
  specialtySlug?: string
): "danmark" | "online" | "city" | "city-specialty" {
  if (locationSlug === "danmark") return "danmark";
  if (locationSlug === "online") return "online";
  if (specialtySlug) return "city-specialty";
  return "city";
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

  const [clinicsData, premiumClinicsData, nearbyData] = await Promise.all([
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
  ]);

  const clinics = mapValidClinics(clinicsData);
  const premiumClinics = mapValidClinics(premiumClinicsData);
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
    specialties,
  };
}

/**
 * Fetches all data needed for the location page
 */
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
    // Return a minimal valid response instead of throwing
    return {
      city: null,
      clinics: [],
      nearbyClinicsList: [],
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

// Generate static params for all cities
export async function generateStaticParams() {
  const { data: cities } = await supabase.from("cities").select("bynavn");
  return cities?.map((city) => ({ location: slugify(city.bynavn) })) || [];
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ location: string; specialty?: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  // Resolve params and searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const filters = parseFilters(resolvedSearchParams);

  const data = await fetchLocationData(
    resolvedParams.location,
    resolvedParams.specialty,
    filters
  );
  const cityName = data.city?.bynavn || deslugify(resolvedParams.location);

  // Get specialty name if present
  const specialtyName = resolvedParams.specialty
    ? data.specialties?.find(
        (s) => s.specialty_name_slug === resolvedParams.specialty
      )?.specialty_name
    : undefined;

  // Generate dynamic meta title using our new utility
  const title = generateMetaTitle(
    cityName,
    specialtyName,
    filters,
    // Only pass clinic count when no filters and no specialty (simple location page)
    !filters.ydernummer && !filters.handicap && !specialtyName
      ? data.clinics.length
      : undefined,
    data.city?.location_preposition
  );

  return {
    title,
    description: `Find og sammenlign ${cityName} fysioterapeuter. Se anbefalinger, fysioterapi specialer, priser, åbningstider og mere. Start her →`,
  };
}

interface LocationPageProps {
  params: Promise<{
    location: string;
    specialty?: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LocationPage({
  params,
  searchParams,
}: LocationPageProps) {
  // Resolve params and searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const filters = parseFilters(resolvedSearchParams);

  const data = await fetchLocationData(
    resolvedParams.location,
    resolvedParams.specialty,
    filters
  );
  const specialties = data.specialties;

  const currentPagePath = resolvedParams.specialty
    ? `/find/fysioterapeut/${resolvedParams.location}/${resolvedParams.specialty}`
    : `/find/fysioterapeut/${resolvedParams.location}`;

  // Get specialty name if we're on a specialty page
  const specialty = resolvedParams.specialty
    ? specialties.find(
        (s: SpecialtyWithSeo) =>
          s.specialty_name_slug === resolvedParams.specialty
      )
    : null;

  // Redirect to location page if specialty doesn't exist but was specified
  if (resolvedParams.specialty && !specialty) {
    redirect(`/find/fysioterapeut/${resolvedParams.location}`);
  }

  const specialtyName = specialty?.specialty_name;

  // Special handling for "danmark" page
  if (resolvedParams.location === "danmark") {
    const { h1, h2 } = generateHeadings("Danmark", specialtyName, filters);
    const shouldShowDanmarkMap = data.clinics.length > 0;
    const denmarkMapCity = {
      id: "danmark",
      bynavn: "Danmark",
      bynavn_slug: "danmark",
      latitude: 56.2639,
      longitude: 9.5018,
      postal_codes: [],
      betegnelse: "Fysioterapeuter i Danmark",
    };

    return (
      <div className="w-full">
        <LocationStructuredData
          clinics={data.clinics}
          specialtyName={specialtyName}
          isDanmarkPage={true}
        />
        <div className="max-w-[800px] mx-auto">
          <Breadcrumbs
            items={[
              { text: "Forside", link: "/" },
              {
                text: "Danmark",
                // Only make it a link if we're on a specialty page
                ...(resolvedParams.specialty && {
                  link: "/find/fysioterapeut/danmark",
                }),
              },
              ...(specialtyName ? [{ text: specialtyName }] : []),
            ]}
          />

          <h1 className="text-2xl md:text-3xl font-bold mb-2">{h1}</h1>
          {h2 && (
            <h2 className="text-base md:text-lg text-gray-600 mb-4">{h2}</h2>
          )}

          {/* Always show description */}
          <p className="text-gray-600 mb-8">
            {data.clinics.length >= 1000 ? "1000+" : data.clinics.length}{" "}
            fysioterapi klinikker i Danmark.
            <span className="hidden md:inline">
              {" "}
              Sammenlign anmeldelser, specialer og mere.
            </span>
          </p>

          <PartnershipBanner specialtySlug={resolvedParams.specialty} />

          <SearchInterface
            specialties={specialties}
            currentSpecialty={resolvedParams.specialty}
            citySlug={resolvedParams.location}
            defaultSearchValue="Danmark"
            showFilters={true}
            initialFilters={filters}
          />
        </div>
        {shouldShowDanmarkMap ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-4">
              <ClinicsList
                clinics={data.clinics}
                totalClinics={data.clinics.length}
                specialtySlug={resolvedParams.specialty}
                trackingContextCityId={denmarkMapCity.id}
              />
            </div>
            <div className="self-start xl:sticky xl:top-24">
              <LocationClinicsMap
                clinics={data.clinics}
                city={denmarkMapCity}
                resultsScopeLabel="Danmark"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-[800px] mx-auto mt-6">
            <ClinicsList
              clinics={data.clinics}
              totalClinics={data.clinics.length}
              specialtySlug={resolvedParams.specialty}
            />
          </div>
        )}

        {resolvedParams.specialty && specialty?.seo_tekst && (
          <div className="max-w-[800px] mx-auto">
            <SeoContent
              source={specialty.seo_tekst}
              currentPagePath={currentPagePath}
            />
          </div>
        )}
      </div>
    );
  }

  // For all other locations, we require city data
  if (!data.city) return notFound();

  const isOnline = resolvedParams.location.toLowerCase() === "online";

  const breadcrumbItems = [
    { text: "Forside", link: "/" },
    {
      text: isOnline ? "Online" : data.city.bynavn,
      // Only make it a link if we're on a specialty page
      ...(resolvedParams.specialty && {
        link: `/find/fysioterapeut/${resolvedParams.location}`,
      }),
    },
    ...(specialtyName ? [{ text: specialtyName }] : []),
  ];

  const { h1, h2 } = generateHeadings(
    isOnline ? "online" : data.city.bynavn,
    specialtyName,
    filters
  );
  const cityPreposition = data.city.location_preposition ?? "i";
  const cityLocationPhrase = `${cityPreposition} ${data.city.bynavn}`;

  return (
    <div className="w-full">
      <LocationStructuredData
        city={data.city}
        clinics={data.clinics}
        specialtyName={specialtyName}
      />
      <div className="max-w-[800px] mx-auto">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-2xl md:text-3xl font-bold mb-2">{h1}</h1>
        {h2 && (
          <h2 className="text-base md:text-lg text-gray-600 mb-4">{h2}</h2>
        )}

        {/* Only show betegnelse if not online */}
        {!isOnline && data.city.betegnelse && (
          <p className="text-gray-600 mb-4">{data.city.betegnelse}</p>
        )}

        {/* Always show description */}
        <p className="text-gray-600 mb-8">
          {isOnline
            ? `${data.clinics.length} online fysioterapi klinikker.`
            : `${data.clinics.length} fysioterapi klinikker ${cityLocationPhrase}.`}
          <span className="hidden md:inline">
            {" "}
            Sammenlign anmeldelser, specialer og mere.
          </span>
        </p>

        {!isOnline && (
          <PartnershipBanner specialtySlug={resolvedParams.specialty} />
        )}

        {/* Search Interface */}
        <SearchInterface
          specialties={specialties}
          currentSpecialty={resolvedParams.specialty}
          citySlug={resolvedParams.location}
          defaultSearchValue={isOnline ? "Online" : data.city.bynavn}
          showFilters={true}
          initialFilters={filters}
        />

        {/* Specialties section */}
        {!resolvedParams.specialty && data.clinics.length > 0 && data.city && (
          <SpecialtiesList
            city={data.city}
            clinics={data.clinics}
            specialties={specialties}
          />
        )}
      </div>

      {data.clinics.length === 0 ? (
        <div className="max-w-[800px] mx-auto">
          <NoResultsFound
            cityName={isOnline ? "Online" : data.city.bynavn}
            specialtyName={specialtyName}
            locationSlug={resolvedParams.location}
          />
        </div>
      ) : (
        <div
          className={`mt-6 grid gap-6 ${
            isOnline ? "" : "xl:grid-cols-[minmax(0,1fr)_420px]"
          }`}
        >
          <div className="space-y-4">
            {data.clinics.map((clinic: Clinic) => (
              <ClinicListingCard
                key={clinic.clinics_id}
                clinicId={clinic.clinics_id}
                klinikNavn={clinic.klinikNavn}
                klinikNavnSlug={clinic.klinikNavnSlug}
                ydernummer={clinic.ydernummer}
                avgRating={clinic.avgRating}
                ratingCount={clinic.ratingCount}
                adresse={clinic.adresse}
                postnummer={clinic.postnummer}
                lokation={clinic.lokation}
                website={clinic.website}
                tlf={clinic.tlf}
                specialties={orderSpecialties(
                  clinic.specialties,
                  resolvedParams.specialty
                )}
                team_members={clinic.team_members}
                premium_listing={clinic.premium_listing}
                handicapadgang={clinic.handicapadgang}
                verified_klinik={clinic.verified_klinik}
                trackingContextCityId={data.city!.id}
              />
            ))}
          </div>

          {!isOnline && (
            <div className="self-start xl:sticky xl:top-24">
              <LocationClinicsMap clinics={data.clinics} city={data.city} />
            </div>
          )}
        </div>
      )}

      {!isOnline && data.clinics.length > 0 && (
        <NearbyClinicsList
          clinics={data.nearbyClinicsList}
          cityName={data.city.bynavn}
          trackingContextCityId={data.city.id}
          specialtySlug={resolvedParams.specialty}
          specialtyName={specialtyName}
        />
      )}

      {data.city.seo_tekst && !resolvedParams.specialty && (
        <SeoContent
          source={data.city.seo_tekst}
          currentPagePath={currentPagePath}
        />
      )}
    </div>
  );
}
