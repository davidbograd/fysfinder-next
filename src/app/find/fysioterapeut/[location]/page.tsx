import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/app/utils/supabase/server";
import ClinicCard from "@/app/components/ClinicCard";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
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
import { SearchAndFilters } from "@/app/components/SearchAndFilters";
import { MDXRemote } from "next-mdx-remote/rsc";

// Create a Supabase client for static generation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
 * Maps a database clinic response to our Clinic type
 */
function mapDBClinicToClinic(dbClinic: DBClinicResponse): Clinic {
  return {
    ...dbClinic,
    specialties: dbClinic.clinic_specialties.map((cs) => cs.specialty),
  };
}

/**
 * Utility function to sort clinics by rating and review count
 */
function sortClinicsByRating<
  T extends { avgRating: number | null; ratingCount: number | null }
>(clinics: T[]): T[] {
  return [...clinics].sort((a, b) => {
    const ratingA = a.avgRating || 0;
    const ratingB = b.avgRating || 0;
    if (ratingA !== ratingB) return ratingB - ratingA;
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
  try {
    // Fetch specialties first as we need them for both cases
    const specialtiesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/specialties?select=specialty_id,specialty_name,specialty_name_slug,seo_tekst`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        next: {
          revalidate: 86400,
        },
      }
    );

    const specialties =
      (await specialtiesResponse.json()) as SpecialtyWithSeo[];

    // Special handling for "danmark" location
    if (locationSlug === "danmark") {
      let clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug))`;

      if (specialtySlug) {
        clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`;
      }

      const clinicsResponse = await fetch(clinicsUrl, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        next: {
          revalidate: 86400,
        },
      });

      const clinicsData = await clinicsResponse.json();
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
    const cityResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/cities?bynavn_slug=eq.${locationSlug}&select=*`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        next: {
          revalidate: 86400,
        },
      }
    );

    const cityData = await cityResponse.json();
    const city = cityData[0] || null;

    if (!city) {
      return {
        city: null,
        clinics: [],
        nearbyClinicsList: [],
        specialties,
      };
    }

    // Build the clinics query for city
    let clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug))&city_id=eq.${city.id}`;

    if (specialtySlug) {
      clinicsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),filtered_specialties:clinic_specialties!inner(specialty:specialties!inner(specialty_name_slug))&city_id=eq.${city.id}&filtered_specialties.specialties.specialty_name_slug=eq.${specialtySlug}`;
    }

    // Fetch clinics and nearby clinics in parallel
    const [clinicsResponse, nearbyResponse] = await Promise.all([
      fetch(clinicsUrl, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        next: {
          revalidate: 86400,
        },
      }),
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/get_nearby_clinics`,
        {
          method: "POST",
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin_lat: city.latitude,
            origin_lng: city.longitude,
            max_distance_km: 10,
            exclude_city_id: city.id,
          }),
          next: {
            revalidate: 86400,
          },
        }
      ),
    ]);

    const [clinicsData, nearbyData] = await Promise.all([
      clinicsResponse.json(),
      nearbyResponse.json(),
    ]);

    // Safely process the clinics data
    const validClinics = Array.isArray(clinicsData)
      ? clinicsData.filter(isValidClinicResponse)
      : [];
    const clinics = validClinics.map(mapDBClinicToClinic);
    const nearbyClinicsList = Array.isArray(nearbyData) ? nearbyData : [];

    return {
      city,
      clinics: sortClinicsByRating(clinics),
      nearbyClinicsList: sortClinicsByRating(nearbyClinicsList),
      specialties,
    };
  } catch (error) {
    console.error("Error in fetchLocationData:", error);
    throw error;
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

          <SearchAndFilters
            specialties={specialties}
            currentSpecialty={params.specialty}
            citySlug={params.location}
            defaultSearchValue="Danmark"
          />

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
                  />
                </Link>
              );
            })}
          </div>

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
          Fysfinder hjælper dig med at finde den bedste fysioterapeut i{" "}
          {data.city.bynavn}. Se anmeldelser, specialer, priser og find den
          perfekte fysioterapeut.
        </p>

        <SearchAndFilters
          specialties={specialties}
          currentSpecialty={params.specialty}
          citySlug={params.location}
          defaultSearchValue={data.city.bynavn}
        />

        {data.clinics.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold mb-4">
              {specialtyName
                ? `Ingen fysioterapeuter med speciale i ${specialtyName} i ${data.city.bynavn}`
                : `Ingen klinikker fundet i ${data.city.bynavn}`}
            </h2>
            <p className="text-gray-600 mb-8">
              {specialtyName
                ? `Vi har desværre ikke registreret nogle fysioterapeuter med dette speciale i ${data.city.bynavn}. Prøv at vælge et andet speciale eller se alle fysioterapeuter i området.`
                : `Vi har desværre ikke registreret nogle fysioterapeuter i dette område endnu.`}
            </p>
            {specialtyName && (
              <Link
                href={`/find/fysioterapeut/${params.location}`}
                className="text-logo-blue hover:underline"
              >
                Se alle fysioterapeuter i {data.city.bynavn} →
              </Link>
            )}
          </div>
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
                    />
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {data.nearbyClinicsList.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">
              Andre klinikker i nærheden af {data.city.bynavn}
            </h2>
            <div className="space-y-4">
              {data.nearbyClinicsList.map((clinic: ClinicWithDistance) => {
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
                      distance={clinic.distance}
                      specialties={orderedSpecialties}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
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
