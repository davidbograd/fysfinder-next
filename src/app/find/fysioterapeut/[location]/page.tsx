import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/app/utils/supabase/server";
import ClinicCard from "@/app/components/ClinicCard";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { deslugify, slugify } from "@/app/utils/slugify";
import { Metadata } from "next";
import { Clinic, City, ClinicWithDistance } from "@/app/types/index";
import { SpecialtyDropdown } from "@/app/components/SpecialtyDropdown";
import { notFound } from "next/navigation";
import { SearchAndFilters } from "@/app/components/SearchAndFilters";

// Create a Supabase client for static generation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Generate static params for all cities
export async function generateStaticParams() {
  const { data: cities } = await supabase.from("cities").select("bynavn");

  return (
    cities?.map((city) => ({
      location: slugify(city.bynavn),
    })) || []
  );
}

export async function fetchCity(locationSlug: string): Promise<City | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("cities")
    .select("*")
    .eq("bynavn_slug", locationSlug)
    .single();

  return data;
}

function sortClinicsByRating<
  T extends { avgRating: number | null; ratingCount: number | null }
>(clinics: T[]): T[] {
  return [...clinics].sort((a, b) => {
    // Handle null/0 ratings
    const ratingA = a.avgRating || 0;
    const ratingB = b.avgRating || 0;

    // If ratings are different, sort by rating
    if (ratingA !== ratingB) {
      return ratingB - ratingA;
    }

    // If ratings are the same, sort by number of reviews
    const countA = a.ratingCount || 0;
    const countB = b.ratingCount || 0;
    return countB - countA;
  });
}

async function fetchClinicsByCity(
  cityId: string,
  specialtySlug?: string
): Promise<Clinic[]> {
  const supabase = createServerClient();

  if (!specialtySlug) {
    const { data, error } = await supabase
      .from("clinics")
      .select(
        `
        *,
        clinic_specialties(
          specialty:specialties(
            specialty_id,
            specialty_name
          )
        )
      `
      )
      .eq("city_id", cityId);

    if (error) throw error;

    const clinics = data.map((clinic: any) => ({
      ...clinic,
      specialties: clinic.clinic_specialties.map((cs: any) => cs.specialty),
    }));

    return sortClinicsByRating(clinics);
  }

  // When a specialty is selected
  const { data, error } = await supabase
    .from("clinics")
    .select(
      `
      *,
      clinic_specialties(
        specialty:specialties(
          specialty_id,
          specialty_name
        )
      ),
      filtered_specialties:clinic_specialties!inner(
        specialty:specialties!inner(
          specialty_name_slug
        )
      )
    `
    )
    .eq("city_id", cityId)
    .eq("filtered_specialties.specialties.specialty_name_slug", specialtySlug);

  if (error) throw error;

  const clinics = data.map((clinic: any) => ({
    ...clinic,
    specialties: clinic.clinic_specialties.map((cs: any) => cs.specialty),
  }));

  return sortClinicsByRating(clinics);
}

async function fetchNearbyClinics(
  latitude: number,
  longitude: number,
  currentCityId: string,
  maxDistance: number = 10
): Promise<ClinicWithDistance[]> {
  const supabase = createServerClient();

  const { data: nearbyClinicsList, error } = await supabase.rpc(
    "get_nearby_clinics",
    {
      origin_lat: latitude,
      origin_lng: longitude,
      max_distance_km: maxDistance,
      exclude_city_id: currentCityId,
    }
  );

  if (error) {
    console.error("Error fetching nearby clinics:", error);
    return [];
  }

  return sortClinicsByRating(nearbyClinicsList || []);
}

async function fetchAllClinics(specialtySlug?: string): Promise<Clinic[]> {
  const supabase = createServerClient();

  if (!specialtySlug) {
    const { data, error } = await supabase.from("clinics").select(`
        *,
        clinic_specialties(
          specialty:specialties(
            specialty_id,
            specialty_name
          )
        )
      `);

    if (error) throw error;

    const clinics = data.map((clinic: any) => ({
      ...clinic,
      specialties: clinic.clinic_specialties.map((cs: any) => cs.specialty),
    }));

    return sortClinicsByRating(clinics);
  }

  // When a specialty is selected
  const { data, error } = await supabase
    .from("clinics")
    .select(
      `
      *,
      clinic_specialties(
        specialty:specialties(
          specialty_id,
          specialty_name
        )
      ),
      filtered_specialties:clinic_specialties!inner(
        specialty:specialties!inner(
          specialty_name_slug
        )
      )
    `
    )
    .eq("filtered_specialties.specialties.specialty_name_slug", specialtySlug);

  if (error) throw error;

  const clinics = data.map((clinic: any) => ({
    ...clinic,
    specialties: clinic.clinic_specialties.map((cs: any) => cs.specialty),
  }));

  return sortClinicsByRating(clinics);
}

export async function generateMetadata({
  params,
}: {
  params: { location: string; specialty?: string };
}): Promise<Metadata> {
  const city = await fetchCity(params.location);
  const cityName = city?.bynavn || deslugify(params.location);

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
    .select("specialty_id, specialty_name, specialty_name_slug");

  if (error) throw error;
  return data;
}

export default async function LocationPage({
  params,
}: {
  params: { location: string; specialty?: string };
}) {
  const [city, specialties] = await Promise.all([
    fetchCity(params.location),
    fetchSpecialties(),
  ]);

  // Get specialty name if we're on a specialty page
  const specialtyName = params.specialty
    ? specialties.find((s) => s.specialty_name_slug === params.specialty)
        ?.specialty_name
    : null;

  // Special handling for "danmark" page
  if (params.location === "danmark") {
    const clinics = await fetchAllClinics(params.specialty);

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
            {clinics.length} fysioterapi klinikker fundet
          </h3>

          <div className="space-y-4">
            {clinics.map((clinic) => (
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
                  specialties={clinic.specialties}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // For all other locations, we require city data
  if (!city) return notFound();

  const clinics = await fetchClinicsByCity(city.id, params.specialty);
  const nearbyClinicsList = await fetchNearbyClinics(
    city.latitude,
    city.longitude,
    city.id
  );

  const breadcrumbItems = [
    { text: "Forside", link: "/" },
    { text: city.bynavn },
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-[800px] mx-auto">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl font-bold mb-2">
          {specialtyName
            ? `Find fysioterapeuter ${city.bynavn} specialiseret i ${specialtyName}`
            : `Find og sammenlign fysioterapeuter ${city.bynavn}`}
        </h1>

        {city.betegnelse && (
          <p className="text-gray-600 mb-4">{city.betegnelse}</p>
        )}

        <p className="text-gray-600 mb-8">
          Fysfinder hjælper dig med at finde den bedste fysioterapeut i{" "}
          {city.bynavn}. Se anmeldelser, specialer, priser og find den perfekte
          fysioterapeut.
        </p>

        <SearchAndFilters
          specialties={specialties}
          currentSpecialty={params.specialty}
          citySlug={params.location}
          defaultSearchValue={city.bynavn}
        />

        {clinics.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold mb-4">
              Ingen klinikker fundet i {city.bynavn}
            </h2>
            <p className="text-gray-600 mb-8">
              Vi har desværre ikke registreret nogle fysioterapeuter i dette
              område endnu.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-sm text-gray-500 mb-4">
              {clinics.length} fysioterapi klinikker fundet
            </h3>

            <div className="space-y-4">
              {clinics.map((clinic) => (
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
                    specialties={clinic.specialties}
                  />
                </Link>
              ))}
            </div>
          </>
        )}

        {nearbyClinicsList.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">
              Andre klinikker i nærheden af {city.bynavn}
            </h2>
            <div className="space-y-4">
              {nearbyClinicsList.map((clinic) => (
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
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {clinics.length === 0 && (
          <Link href="/" className="text-blue-600 hover:underline">
            Se alle områder
          </Link>
        )}
      </div>
    </div>
  );
}
