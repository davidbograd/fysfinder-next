import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/app/utils/supabase/server";
import ClinicCard from "@/components/features/clinic/ClinicCard";
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
import { notFound } from "next/navigation";
import { SearchAndFilters } from "@/components/features/search/SearchAndFilters";
import { MDXRemote } from "next-mdx-remote/rsc";
import { SpecialtiesList } from "@/components/features/specialty/SpecialtiesList";
import { ClinicsList } from "@/components/features/clinic/ClinicsList";
import { NoResultsFound } from "@/app/find/fysioterapeut/[location]/components/NoResultsFound";
import { NearbyClinicsList } from "@/app/find/fysioterapeut/[location]/components/NearbyClinicsList";

// Create a Supabase client for static generation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Add this utility function at the top of the file
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
  console.log("Current date:", now);
  console.log("Start date:", new Date(clinic.premium_listing.start_date));
  console.log("End date:", new Date(clinic.premium_listing.end_date));
  const isActive =
    new Date(clinic.premium_listing.start_date) <= now &&
    new Date(clinic.premium_listing.end_date) > now;
  console.log("Is premium active:", isActive);
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
 * Utility function to sort clinics by premium status and rating
 */
function sortClinicsByRating<
  T extends { avgRating: number | null; ratingCount: number | null }
>(clinics: T[]): T[] {
  return [...clinics].sort((a, b) => {
    // First sort by premium status
    const aPremium = isPremiumActive(a as unknown as Clinic);
    const bPremium = isPremiumActive(b as unknown as Clinic);
    if (aPremium !== bPremium) return bPremium ? 1 : -1;

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
  specialtySlug?: string
): Promise<LocationPageData> {
  console.log("🚀 Starting fetchLocationData for:", locationSlug);

  const headers = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  };

  const fetchOptions = {
    headers,
    next: { revalidate: 86400 },
  };

  try {
    // Fetch specialties first as we need them for both cases
    const specialties = (await fetchWithRetry(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/specialties?select=specialty_id,specialty_name,specialty_name_slug,seo_tekst`,
      fetchOptions
    )) as SpecialtyWithSeo[];

    // Special handling for "danmark" location
    if (locationSlug === "danmark") {
      console.log("📍 Danmark page");
      let clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),premium_listings(id,start_date,end_date)`;

      if (specialtySlug) {
        clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),premium_listings(id,start_date,end_date),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`;
      }

      const clinicsData = await fetchWithRetry(clinicsUrl, fetchOptions);
      const validClinics = (clinicsData as unknown[]).filter(
        isValidClinicResponse
      );
      const clinics = validClinics.map(mapDBClinicToClinic);

      return {
        city: null,
        clinics: sortClinicsByRating(clinics),
        nearbyClinicsList: [],
        specialties,
      };
    }

    // For specific city locations
    console.log("🌍 Fetching city data for:", locationSlug);
    const cityData = await fetchWithRetry(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/cities?bynavn_slug=eq.${locationSlug}&select=*`,
      fetchOptions
    );

    const city = cityData[0] || null;
    console.log("🏙️ City found:", city?.bynavn || "No city found");

    if (!city) {
      return {
        city: null,
        clinics: [],
        nearbyClinicsList: [],
        specialties,
      };
    }

    // Check for premium listings in this city
    console.log("🔍 Starting premium listings check for:", city.bynavn);
    const premiumListingsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/premium_listing_locations?select=premium_listings(id,clinic_id,start_date,end_date,clinics(klinikNavn))&city_id=eq.${city.id}`;
    const premiumListingsData = await fetchWithRetry(
      premiumListingsUrl,
      fetchOptions
    );

    if (Array.isArray(premiumListingsData) && premiumListingsData.length > 0) {
      console.log(
        "✨ Found premium listings:",
        premiumListingsData.map((pl) => ({
          clinic: pl.premium_listings.clinics.klinikNavn,
          start: pl.premium_listings.start_date,
          end: pl.premium_listings.end_date,
        }))
      );
    } else {
      console.log("📭 No premium listings found for", city.bynavn);
    }

    // Build the clinics query for city
    let clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings(id,start_date,end_date)&city_id=eq.${city.id}`;

    if (specialtySlug) {
      clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings(id,start_date,end_date),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))&city_id=eq.${city.id}&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`;
    }

    // Fetch premium clinics for this city
    const premiumClinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),premium_listings!inner(id,start_date,end_date,premium_listing_locations!inner(city_id))&premium_listings.premium_listing_locations.city_id=eq.${city.id}`;

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

    const nearbyClinicsList = Array.isArray(nearbyData) ? nearbyData : [];

    return {
      city,
      clinics: sortClinicsByRating(allClinics),
      nearbyClinicsList: sortClinicsByRating(nearbyClinicsList),
      specialties,
    };
  } catch (error) {
    console.error("Error in fetchLocationData:", error);
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

export async function generateMetadata({
  params,
}: {
  params: { location: string; specialty?: string };
}): Promise<Metadata> {
  const data = await fetchLocationData(params.location);
  const cityName = data.city?.bynavn || deslugify(params.location);

  return {
    title: `Fysioterapi klinikker ${cityName} | Find fysioterapeuter ›`,
    description: `Find og sammenlign ${cityName} fysioterapeuter. Se anbefalinger, fysioterapi specialer, priser, åbningstider og mere. Start her →`,
  };
}

// Keep your existing seoContent array here...

export async function fetchSpecialties() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("specialties")
    .select("specialty_id, specialty_name, specialty_name_slug, seo_tekst");

  if (error) throw error;
  return data;
}

interface LocationStructuredDataProps {
  city: City;
  clinics: Clinic[];
  specialtyName?: string | null;
}

function LocationStructuredData({
  city,
  clinics,
  specialtyName,
}: LocationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: specialtyName
      ? `Fysioterapeuter i ${city.bynavn} specialiseret i ${specialtyName}`
      : `Fysioterapeuter i ${city.bynavn}`,
    url: `https://www.fysfinder.dk/find/fysioterapeut/${city.bynavn_slug}${
      specialtyName ? `/${slugify(specialtyName)}` : ""
    }`,

    // Medical Specialty Organization
    about: {
      "@type": "MedicalSpecialty",
      name: specialtyName || "Fysioterapi",
      relevantSpecialty: {
        "@type": "MedicalSpecialty",
        name: "Physical Therapy",
      },
    },
    specialty: specialtyName || "Fysioterapi",
    medicalAudience: "Patienter der søger fysioterapi",

    // Location/Area Served
    areaServed: {
      "@type": "City",
      name: city.bynavn,
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.latitude,
        longitude: city.longitude,
      },
    },

    // List of Clinics
    mainEntity: {
      "@type": "ItemList",
      itemListElement: clinics.map((clinic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": ["LocalBusiness", "MedicalBusiness"],
          name: clinic.klinikNavn,
          url: `https://www.fysfinder.dk/klinik/${clinic.klinikNavnSlug}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: clinic.lokation,
            postalCode: clinic.postnummer,
            streetAddress: clinic.adresse,
            addressCountry: "DK",
          },
          ...(clinic.avgRating && clinic.ratingCount > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: clinic.avgRating,
                  reviewCount: clinic.ratingCount,
                  bestRating: 5,
                  worstRating: 1,
                },
              }
            : {}),
          medicalSpecialty: [
            "Physical Therapy",
            ...clinic.specialties.map((s) => s.specialty_name),
          ],
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface LocationPageProps {
  params: {
    location: string;
    specialty?: string;
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const data = await fetchLocationData(params.location, params.specialty);
  const specialties = data.specialties;

  // Get specialty name if we're on a specialty page
  const specialtyName = params.specialty
    ? specialties.find(
        (s: SpecialtyWithSeo) => s.specialty_name_slug === params.specialty
      )?.specialty_name
    : null;

  // Special handling for "danmark" page
  if (params.location === "danmark") {
    const specialty = params.specialty
      ? specialties.find(
          (s: SpecialtyWithSeo) => s.specialty_name_slug === params.specialty
        )
      : null;

    return (
      <div className="container mx-auto px-4">
        <div className="max-w-[800px] mx-auto">
          <Breadcrumbs
            items={[{ text: "Forside", link: "/" }, { text: "Danmark" }]}
          />

          <h1 className="text-3xl font-bold mb-2">
            {specialtyName
              ? `Find fysioterapeuter specialiseret i ${specialtyName}`
              : "Find og sammenlign fysioterapeuter i Danmark"}
          </h1>

          <p className="text-gray-600 mb-8">
            Fysfinder hjælper dig med at finde den bedste fysioterapeut i
            Danmark. Se anmeldelser, specialer, priser og find den perfekte
            fysioterapeut.
          </p>

          {/* Kroniske smerter samarbejde med FAKS */}
          {params.specialty === "kroniske-smerter" && (
            <div className="mb-4 flex flex-wrap items-center gap-4 sm:gap-8">
              <Image
                src="/images/samarbejdspartnere/FAKS-smertelinjen-logo.png"
                alt="FAKS - Foreningen af kroniske smerteramte og pårørende"
                width={640}
                height={400}
                className="w-full sm:max-w-[400px] h-auto"
              />
              <p className="text-gray-600 w-full sm:w-auto sm:flex-1">
                I samarbejde med FAKS, Foreningen af kroniske smerteramte og
                pårørende.
              </p>
            </div>
          )}

          <SearchAndFilters
            specialties={specialties}
            currentSpecialty={params.specialty}
            citySlug={params.location}
            defaultSearchValue="Danmark"
          />

          <ClinicsList
            clinics={data.clinics}
            totalClinics={data.clinics.length}
            specialtySlug={params.specialty}
          />

          {/* Add SEO text for specialty when on danmark page */}
          {params.specialty && specialty?.seo_tekst && (
            <div
              className="mt-12 prose prose-slate max-w-none
                prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:mt-8
                prose-h3:text-xl prose-h3:font-medium prose-h3:mb-3 prose-h3:mt-6
                prose-p:text-gray-600 prose-p:mb-4 prose-p:leading-relaxed
                prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:text-gray-600
                prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:text-gray-600
                prose-li:mb-2 prose-li:leading-relaxed
                prose-strong:font-semibold prose-strong:text-gray-900
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                [&>*:first-child]:mt-0
                [&>*:last-child]:mb-0"
            >
              <MDXRemote source={specialty.seo_tekst} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // For all other locations, we require city data
  if (!data.city) return notFound();

  const breadcrumbItems = [
    { text: "Forside", link: "/" },
    { text: data.city.bynavn },
  ];

  return (
    <div className="container mx-auto px-4">
      <LocationStructuredData
        city={data.city}
        clinics={data.clinics}
        specialtyName={specialtyName}
      />
      <div className="max-w-[800px] mx-auto">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl font-bold mb-2">
          {specialtyName
            ? `Find fysioterapeuter ${data.city.bynavn} specialiseret i ${specialtyName}`
            : `Find og sammenlign fysioterapeuter ${data.city.bynavn}`}
        </h1>

        {data.city.betegnelse && (
          <p className="text-gray-600 mb-4">{data.city.betegnelse}</p>
        )}

        <p className="text-gray-600 mb-8">
          Find den bedste fysioterapi i {data.city.bynavn}. Se anmeldelser,
          specialer, priser og find den perfekte fysioterapeut.
        </p>

        {params.specialty === "kroniske-smerter" && (
          <div className="mb-4 flex flex-wrap items-center gap-4 sm:gap-8">
            <Image
              src="/images/samarbejdspartnere/FAKS-smertelinjen-logo.png"
              alt="FAKS - Foreningen af kroniske smerteramte og pårørende"
              width={640}
              height={400}
              className="w-full sm:max-w-[400px] h-auto"
            />
            <p className="text-gray-600 w-full sm:w-auto sm:flex-1">
              I samarbejde med FAKS, Foreningen af kroniske smerteramte og
              pårørende.
            </p>
          </div>
        )}

        <SearchAndFilters
          specialties={specialties}
          currentSpecialty={params.specialty}
          citySlug={params.location}
          defaultSearchValue={data.city.bynavn}
        />

        {/* Specialties section */}
        {!params.specialty && data.clinics.length > 0 && data.city && (
          <SpecialtiesList
            city={data.city}
            clinics={data.clinics}
            specialties={specialties}
          />
        )}

        {data.clinics.length === 0 ? (
          <NoResultsFound
            cityName={data.city.bynavn}
            specialtyName={specialtyName}
            locationSlug={params.location}
          />
        ) : (
          <>
            <h3 className="text-sm text-gray-500 mb-4">
              {data.clinics.length} fysioterapi klinikker fundet
            </h3>

            <div className="space-y-4">
              {data.clinics.map((clinic: Clinic) => {
                // If we're on a specialty page, reorder the specialties array to show the current specialty first
                let orderedSpecialties = clinic.specialties;
                if (params.specialty && clinic.specialties) {
                  orderedSpecialties = [
                    ...clinic.specialties.filter(
                      (s) => s.specialty_name_slug === params.specialty
                    ),
                    ...clinic.specialties.filter(
                      (s) => s.specialty_name_slug !== params.specialty
                    ),
                  ];
                }

                return (
                  <Link
                    key={clinic.clinics_id}
                    href={`/klinik/${clinic.klinikNavnSlug}`}
                    className="block"
                  >
                    <ClinicCard
                      klinikNavn={clinic.klinikNavn}
                      ydernummer={clinic.ydernummer}
                      avgRating={clinic.avgRating}
                      ratingCount={clinic.ratingCount}
                      adresse={clinic.adresse}
                      postnummer={clinic.postnummer}
                      lokation={clinic.lokation}
                      specialties={orderedSpecialties}
                      team_members={clinic.team_members}
                      premium_listing={clinic.premium_listing}
                    />
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <NearbyClinicsList
          clinics={data.nearbyClinicsList}
          cityName={data.city.bynavn}
          specialtySlug={params.specialty}
        />
      </div>

      {/* Only show SEO text if we're not on a specialty page */}
      {data.city.seo_tekst && !params.specialty && (
        <div
          className="mt-12 prose prose-slate max-w-none
             prose-headings:text-gray-900
             prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:mt-8
             prose-h3:text-xl prose-h3:font-medium prose-h3:mb-3 prose-h3:mt-6
             prose-p:text-gray-600 prose-p:mb-4 prose-p:leading-relaxed
             prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:text-gray-600
             prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:text-gray-600
             prose-li:mb-2 prose-li:leading-relaxed
             prose-strong:font-semibold prose-strong:text-gray-900
             prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
             [&>*:first-child]:mt-0
             [&>*:last-child]:mb-0"
        >
          <MDXRemote source={data.city.seo_tekst} />
        </div>
      )}
    </div>
  );
}
