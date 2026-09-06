// Location page - shared location rendering with city/specialty data fetching.
// Updated: 2026-09-06 - Send only the first listing page, slim map markers, and capped JSON-LD to the client.

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { deslugify, slugify } from "@/app/utils/slugify";
import { Metadata } from "next";
import { SpecialtyWithSeo } from "@/app/types/index";
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
import {
  generateHeadings,
  generateMetaTitle,
} from "@/lib/headers-and-metatitles";
import { createStaticClient } from "@/app/utils/supabase/static";
import { parseFilters } from "@/app/find/fysioterapeut/filter-utils";
import { fetchLocationData } from "@/app/find/fysioterapeut/[location]/fetch-location-data";
import {
  getLocationMapClinics,
  getSpecialtyMatchCounts,
  LOCATION_LIST_PAGE_SIZE,
} from "@/lib/location-listing";

export const revalidate = 86400; // 24 hours ISR (must be a literal for Next.js segment config)
export { fetchLocationData };

const supabase = createStaticClient();

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
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const filters = parseFilters(resolvedSearchParams);

  const data = await fetchLocationData(
    resolvedParams.location,
    resolvedParams.specialty,
    filters
  );
  const cityName = data.city?.bynavn || deslugify(resolvedParams.location);

  const specialtyName = resolvedParams.specialty
    ? data.specialties?.find(
        (s) => s.specialty_name_slug === resolvedParams.specialty
      )?.specialty_name
    : undefined;

  const title = generateMetaTitle(
    cityName,
    specialtyName,
    filters,
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
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const filters = parseFilters(resolvedSearchParams);

  const data = await fetchLocationData(
    resolvedParams.location,
    resolvedParams.specialty,
    filters
  );
  const specialties = data.specialties;
  const visibleClinics = data.clinics.slice(0, LOCATION_LIST_PAGE_SIZE);
  const mapClinics = getLocationMapClinics(data.clinics);

  const currentPagePath = resolvedParams.specialty
    ? `/find/fysioterapeut/${resolvedParams.location}/${resolvedParams.specialty}`
    : `/find/fysioterapeut/${resolvedParams.location}`;

  const specialty = resolvedParams.specialty
    ? specialties.find(
        (s: SpecialtyWithSeo) =>
          s.specialty_name_slug === resolvedParams.specialty
      )
    : null;

  if (resolvedParams.specialty && !specialty) {
    redirect(`/find/fysioterapeut/${resolvedParams.location}`);
  }

  const specialtyName = specialty?.specialty_name;

  if (resolvedParams.location === "danmark") {
    const { h1, h2 } = generateHeadings("Danmark", specialtyName, filters);
    const shouldShowDanmarkMap = mapClinics.length > 0;
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
                initialClinics={visibleClinics}
                totalClinics={data.clinics.length}
                locationSlug={resolvedParams.location}
                specialtySlug={resolvedParams.specialty}
                filters={filters}
                trackingContextCityId={denmarkMapCity.id}
              />
            </div>
            <div className="self-start xl:sticky xl:top-24">
              <LocationClinicsMap
                clinics={mapClinics}
                city={denmarkMapCity}
                resultsScopeLabel="Danmark"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-[800px] mx-auto mt-6">
            <ClinicsList
              initialClinics={visibleClinics}
              totalClinics={data.clinics.length}
              locationSlug={resolvedParams.location}
              specialtySlug={resolvedParams.specialty}
              filters={filters}
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

  if (!data.city) return notFound();

  const isOnline = resolvedParams.location.toLowerCase() === "online";

  const breadcrumbItems = [
    { text: "Forside", link: "/" },
    {
      text: isOnline ? "Online" : data.city.bynavn,
      ...(resolvedParams.specialty && {
        link: `/find/fysioterapeut/${resolvedParams.location}`,
      }),
    },
    ...(specialtyName ? [{ text: specialtyName }] : []),
  ];

  const cityPreposition = data.city.location_preposition ?? "i";
  const cityLocationPhrase = `${cityPreposition} ${data.city.bynavn}`;

  const { h1, h2 } = generateHeadings(
    isOnline ? "online" : data.city.bynavn,
    specialtyName,
    filters,
    isOnline ? null : cityPreposition
  );

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

        {!isOnline && data.city.betegnelse && (
          <p className="text-gray-600 mb-4">{data.city.betegnelse}</p>
        )}

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

        <SearchInterface
          specialties={specialties}
          currentSpecialty={resolvedParams.specialty}
          citySlug={resolvedParams.location}
          defaultSearchValue={isOnline ? "Online" : data.city.bynavn}
          showFilters={true}
          initialFilters={filters}
        />

        {!resolvedParams.specialty && data.clinics.length > 0 && data.city && (
          <SpecialtiesList
            city={data.city}
            specialties={specialties}
            specialtyMatchCounts={getSpecialtyMatchCounts(
              data.clinics,
              specialties
            )}
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
            <ClinicsList
              initialClinics={visibleClinics}
              totalClinics={data.clinics.length}
              locationSlug={resolvedParams.location}
              specialtySlug={resolvedParams.specialty}
              filters={filters}
              trackingContextCityId={data.city.id}
            />
          </div>

          {!isOnline && (
            <div className="self-start xl:sticky xl:top-24">
              <LocationClinicsMap clinics={mapClinics} city={data.city} />
            </div>
          )}
        </div>
      )}

      {!isOnline && data.clinics.length > 0 && (
        <NearbyClinicsList
          clinics={data.nearbyClinicsList}
          nearbyCities={data.nearbyCities}
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
