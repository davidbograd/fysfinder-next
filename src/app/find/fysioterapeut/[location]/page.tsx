// Location page - refactored to extract shared components and utilities
// PartnershipBanner, SeoContent, orderSpecialties, and parseFilters extracted to reduce duplication

import React from "react";
import ClinicCard from "@/components/features/clinic/ClinicCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { deslugify, slugify } from "@/app/utils/slugify";
import { Metadata } from "next";
import {
  Clinic,
  City,
  DBClinicResponse,
  LocationPageData,
  SpecialtyWithSeo,
} from "@/app/types/index";
import { notFound, redirect } from "next/navigation";

import { SpecialtiesList } from "@/components/features/specialty/SpecialtiesList";
import { ClinicsList } from "@/components/features/clinic/ClinicsList";
import { NoResultsFound } from "@/app/find/fysioterapeut/[location]/components/NoResultsFound";
import { NearbyClinicsList } from "@/app/find/fysioterapeut/[location]/components/NearbyClinicsList";
import { LocationStructuredData } from "@/components/seo/LocationStructuredData";
import { SearchInterface } from "@/components/search/SearchInterface";
import { PartnershipBanner } from "@/components/features/partnership/PartnershipBanner";
import { SeoContent } from "@/components/seo/SeoContent";
import { orderSpecialties } from "@/lib/clinic-utils";

// Heading generation utility
import {
  generateHeadings,
  generateMetaTitle,
} from "@/lib/headers-and-metatitles";
import { CACHE_TIMES } from "@/lib/cache-config";
import { createStaticClient } from "@/app/utils/supabase/static";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)

// Supabase client for static generation (no cookies, safe for ISR)
const supabase = createStaticClient();

async function fetchWithRetry(
  url: string,
  options: any,
  retries = 3,
  delay = 1000
) {
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
  const clinic = data as any;
  return (
    "clinics_id" in clinic &&
    "klinikNavn" in clinic &&
    "clinic_specialties" in clinic &&
    Array.isArray(clinic.clinic_specialties)
  );
}

/**
 * Checks if a clinic has active premium status
 */
function isPremiumActive(clinic: Clinic): boolean {
  if (!clinic.premium_listing) return false;
  const now = new Date();
  const isActive =
    new Date(clinic.premium_listing.start_date) <= now &&
    new Date(clinic.premium_listing.end_date) > now;
  return isActive;
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

/**
 * Utility function to sort clinics by rating, optionally considering premium status
 */
function sortClinicsByRating<
  T extends { avgRating: number | null; ratingCount: number | null }
>(clinics: T[], options: { includePremium?: boolean } = {}): T[] {
  const { includePremium = true } = options;
  return [...clinics].sort((a, b) => {
    // Optionally sort by premium status first
    if (includePremium) {
      const aPremium = isPremiumActive(a as unknown as Clinic);
      const bPremium = isPremiumActive(b as unknown as Clinic);
      if (aPremium !== bPremium) return bPremium ? 1 : -1;
    }

    // Then sort by rating
    const ratingA = a.avgRating || 0;
    const ratingB = b.avgRating || 0;
    if (ratingA !== ratingB) return ratingB - ratingA;

    // Finally sort by review count
    const countA = a.ratingCount || 0;
    const countB = b.ratingCount || 0;
    return countB - countA;
  });
}

/**
 * Fetches all data needed for the location page
 */
export async function fetchLocationData(
  locationSlug: string,
  specialtySlug?: string,
  filters?: { ydernummer?: boolean; handicap?: boolean }
): Promise<LocationPageData> {
  const headers = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  };

  const fetchOptions = {
    headers,
    next: { revalidate: CACHE_TIMES.LOCATION_PAGE },
  };

  try {
    // Fetch specialties first as we need them for both cases
    const specialties = (await fetchWithRetry(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/specialties?select=specialty_id,specialty_name,specialty_name_slug,seo_tekst`,
      fetchOptions
    )) as SpecialtyWithSeo[];

    // Special handling for "danmark" location
    if (locationSlug === "danmark") {
      let clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),premium_listings(id,start_date,end_date,booking_link)`;

      if (specialtySlug) {
        clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),premium_listings(id,start_date,end_date,booking_link),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`;
      }

      // Apply filters
      if (filters?.ydernummer) {
        clinicsUrl += `&ydernummer=eq.true`;
      }
      if (filters?.handicap) {
        clinicsUrl += `&handicapadgang=eq.true`;
      }

      const clinicsData = await fetchWithRetry(clinicsUrl, fetchOptions);
      const validClinics = (clinicsData as unknown[]).filter(
        isValidClinicResponse
      );
      const clinics = validClinics.map(mapDBClinicToClinic);

      return {
        city: null,
        clinics: sortClinicsByRating(clinics, { includePremium: false }),
        nearbyClinicsList: [],
        specialties,
      };
    }

    // Special handling for "online" location
    if (locationSlug === "online") {
      let cityForOnline: City | null = null;
      try {
        const cityData = await fetchWithRetry(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/cities?bynavn_slug=eq.online&select=*`,
          fetchOptions
        );
        cityForOnline = cityData[0] || null;
      } catch (error) {
        console.warn("Could not fetch city data for 'online' location:", error);
        // Proceed without DB city data for online
      }

      // Use fetched city data if available, otherwise create minimal object
      const finalCityObject = cityForOnline || {
        id: "online",
        bynavn: "Online",
        bynavn_slug: "online",
        latitude: 0,
        longitude: 0,
        postal_codes: [],
        betegnelse: "Online fysioterapi",
        seo_tekst: undefined, // Explicitly undefined in fallback
      };

      let clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings(id,start_date,end_date,booking_link)`;

      // Add specialty filter if needed
      const specialtyFilter = specialtySlug
        ? `&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`
        : "";

      // If specialty is specified, modify the query to include specialty join
      if (specialtySlug) {
        clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings(id,start_date,end_date,booking_link),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))${specialtyFilter}`;
      }

      // Add the OR condition for online clinics
      clinicsUrl += `&or=(lokationSlug.eq.online,online_fysioterapeut.eq.true)`;

      // Apply filters
      if (filters?.ydernummer) {
        clinicsUrl += `&ydernummer=eq.true`;
      }
      if (filters?.handicap) {
        clinicsUrl += `&handicapadgang=eq.true`;
      }

      const clinicsData = await fetchWithRetry(clinicsUrl, fetchOptions);
      const validClinics = (clinicsData as unknown[]).filter(
        isValidClinicResponse
      );
      const clinics = validClinics.map(mapDBClinicToClinic);

      return {
        city: finalCityObject,
        clinics: sortClinicsByRating(clinics),
        nearbyClinicsList: [],
        specialties,
      };
    }

    // For specific city locations
    const cityData = await fetchWithRetry(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/cities?bynavn_slug=eq.${locationSlug}&select=*`,
      fetchOptions
    );

    const city = cityData[0] || null;

    if (!city) {
      return {
        city: null,
        clinics: [],
        nearbyClinicsList: [],
        specialties,
      };
    }

    // Check for premium listings in this city
    const premiumListingsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/premium_listing_locations?select=premium_listings(id,clinic_id,start_date,end_date,booking_link,clinics(klinikNavn))&city_id=eq.${city.id}`;
    const premiumListingsData = await fetchWithRetry(
      premiumListingsUrl,
      fetchOptions
    );

    // Build the clinics query for city
    let clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings(id,start_date,end_date,booking_link)&city_id=eq.${city.id}`;

    if (specialtySlug) {
      clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings(id,start_date,end_date,booking_link),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))&city_id=eq.${city.id}&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`;
    }

    // Fetch premium clinics for this city
    let premiumClinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings!inner(id,start_date,end_date,booking_link,premium_listing_locations!inner(city_id))&premium_listings.premium_listing_locations.city_id=eq.${city.id}`;

    if (specialtySlug) {
      premiumClinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings!inner(id,start_date,end_date,booking_link,premium_listing_locations!inner(city_id)),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))&premium_listings.premium_listing_locations.city_id=eq.${city.id}&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`;
    }

    // Apply filters to both clinic queries
    if (filters?.ydernummer) {
      clinicsUrl += `&ydernummer=eq.true`;
      premiumClinicsUrl += `&ydernummer=eq.true`;
    }
    if (filters?.handicap) {
      clinicsUrl += `&handicapadgang=eq.true`;
      premiumClinicsUrl += `&handicapadgang=eq.true`;
    }

    // Fetch clinics, premium clinics, and nearby clinics in parallel with retry
    const [clinicsData, premiumClinicsData, nearbyData] = await Promise.all([
      fetchWithRetry(clinicsUrl, fetchOptions),
      fetchWithRetry(premiumClinicsUrl, fetchOptions),
      fetchWithRetry(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/get_nearby_clinics`,
        {
          ...fetchOptions,
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            origin_lat: city.latitude,
            origin_lng: city.longitude,
            max_distance_km: 10,
            exclude_city_id: city.id,
          }),
        }
      ),
    ]);

    // Safely process the clinics data
    const validClinics = Array.isArray(clinicsData)
      ? clinicsData.filter(isValidClinicResponse)
      : [];
    const validPremiumClinics = Array.isArray(premiumClinicsData)
      ? premiumClinicsData.filter(isValidClinicResponse)
      : [];

    // Map both sets of clinics
    const clinics = validClinics.map(mapDBClinicToClinic);
    const premiumClinics = validPremiumClinics.map(mapDBClinicToClinic);

    // Combine premium and regular clinics, ensuring no duplicates
    const allClinics = [
      ...premiumClinics,
      ...clinics.filter(
        (clinic) =>
          !premiumClinics.some((pc) => pc.clinics_id === clinic.clinics_id)
      ),
    ];

    let nearbyClinicsList = Array.isArray(nearbyData) ? nearbyData : [];

    // Filter nearby clinics by specialty if a specialty is specified
    if (specialtySlug && nearbyClinicsList.length > 0) {
      // Create a mapping of specialty names to slugs for quick lookup
      const specialtyNameToSlug = new Map(
        specialties.map((s) => [s.specialty_name, s.specialty_name_slug])
      );

      nearbyClinicsList = nearbyClinicsList.filter((clinic: any) => {
        // Check if clinic has the required specialty
        if (
          !clinic.clinic_specialties ||
          !Array.isArray(clinic.clinic_specialties)
        ) {
          return false;
        }

        return clinic.clinic_specialties.some((cs: any) => {
          const specialtySlugFromName = specialtyNameToSlug.get(
            cs.specialty_name
          );
          return specialtySlugFromName === specialtySlug;
        });
      });
    }

    return {
      city,
      clinics: sortClinicsByRating(allClinics),
      nearbyClinicsList: sortClinicsByRating(nearbyClinicsList),
      specialties,
    };
  } catch (error) {
    // Return a minimal valid response instead of throwing
    return {
      city: null,
      clinics: [],
      nearbyClinicsList: [],
      specialties: [],
    };
  }
}

// Generate static params for all cities
export async function generateStaticParams() {
  const { data: cities } = await supabase.from("cities").select("bynavn");
  return cities?.map((city) => ({ location: slugify(city.bynavn) })) || [];
}

/**
 * Parses filter parameters from URL search params
 */
export function parseFilters(
  searchParams: { [key: string]: string | string[] | undefined } | undefined
): { ydernummer?: boolean; handicap?: boolean } {
  const filters: { ydernummer?: boolean; handicap?: boolean } = {};
  if (searchParams?.ydernummer === "true") filters.ydernummer = true;
  if (searchParams?.handicap === "true") filters.handicap = true;
  return filters;
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
      : undefined
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

    return (
      <div className="container mx-auto px-4">
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

          <ClinicsList
            clinics={data.clinics}
            totalClinics={data.clinics.length}
            specialtySlug={resolvedParams.specialty}
          />

          {resolvedParams.specialty && specialty?.seo_tekst && (
            <SeoContent
              source={specialty.seo_tekst}
              currentPagePath={currentPagePath}
            />
          )}
        </div>
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

  return (
    <div className="container mx-auto px-4">
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
            : `${data.clinics.length} fysioterapi klinikker i ${data.city.bynavn}.`}
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

        {data.clinics.length === 0 ? (
          <NoResultsFound
            cityName={isOnline ? "Online" : data.city.bynavn}
            specialtyName={specialtyName}
            locationSlug={resolvedParams.location}
          />
        ) : (
          <div className="space-y-4">
            {data.clinics.map((clinic: Clinic) => (
              <ClinicCard
                key={clinic.clinics_id}
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
                specialties={orderSpecialties(clinic.specialties, resolvedParams.specialty)}
                team_members={clinic.team_members}
                premium_listing={clinic.premium_listing}
                handicapadgang={clinic.handicapadgang}
                verified_klinik={clinic.verified_klinik}
              />
            ))}
          </div>
        )}

        {/* Hide NearbyClinicsList for Online location */}
        {!isOnline && (
          <NearbyClinicsList
            clinics={data.nearbyClinicsList}
            cityName={data.city.bynavn}
            specialtySlug={resolvedParams.specialty}
            specialtyName={specialtyName}
          />
        )}
      </div>

      {data.city.seo_tekst && !resolvedParams.specialty && (
        <SeoContent
          source={data.city.seo_tekst}
          currentPagePath={currentPagePath}
        />
      )}
    </div>
  );
}
