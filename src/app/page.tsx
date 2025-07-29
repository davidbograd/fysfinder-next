import React from "react";
import { Metadata } from "next";
import { FAQ } from "@/components/features/blog-og-ordbog/FAQ";
import { SearchAndFilters } from "@/components/features/search/SearchAndFilters";
import { MigrationWrapper } from "@/components/search-v2/MigrationWrapper";
import { RegionList } from "@/components/features/search/RegionList";
import { BenefitsSection } from "@/components/features/blog-og-ordbog/BenefitsSection";
import { StarIcon } from "@heroicons/react/24/solid";
import {
  fetchCitiesWithCounts,
  fetchSpecialties,
  processCities,
  type CityWithCount,
  type RegionData,
  type Specialty,
} from "./utils/cityUtils";

export const dynamic = "force-dynamic";

const regions: { [key: string]: { name: string; range: [number, number] } } = {
  hovedstaden: { name: "Hovedstaden", range: [1000, 2999] },
  sjaelland: { name: "Sjælland", range: [3000, 4999] },
  syddanmark: { name: "Syddanmark", range: [5000, 6999] },
  midtjylland: { name: "Midtjylland", range: [7000, 8999] },
  nordjylland: { name: "Nordjylland", range: [9000, 9999] },
};

function Header({
  totalClinics,
  specialties,
}: {
  totalClinics: number;
  specialties: Specialty[];
}) {
  return (
    <div className="mb-8 sm:mb-12 w-full">
      {/* Hero section with background image */}
      <div className="relative py-16 sm:py-28 px-4 min-h-[65vh] flex flex-col justify-center w-full mb-16">
        {/* Background image container with overflow hidden */}
        <div className="absolute inset-0 z-0 rounded-lg overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url('/images/homepage/hero-background-image.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto w-full space-y-12">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-slate-900 font-normal">
              Find den bedste
              <br />
              <span className="font-bold">fysioterapeut</span>
            </h1>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            {/* Original Search */}
            <SearchAndFilters
              specialties={specialties}
              defaultSearchValue=""
              citySlug="danmark"
            />

            {/* New Search (Testing) */}
            <div className="mt-8 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
              <div className="text-sm text-blue-600 mb-2 font-medium">
                🚧 New Search Interface (Testing)
              </div>
              <MigrationWrapper
                specialties={specialties}
                defaultSearchValue=""
                citySlug="danmark"
                showFilters={false}
                initialFilters={{}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <p className="text-4xl font-bold">{totalClinics}</p>
            <p className="text-slate-600">danske fysioterapi klinikker</p>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-bold">{specialties.length}</p>
            <p className="text-slate-600">forskellige specialer</p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold flex justify-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-8 w-8 text-amber-500" />
                ))}
              </div>
            </div>
            <p className="text-slate-600">Den bedste oplevelse</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface HomeStructuredDataProps {
  totalClinics: number;
  regions: RegionData[];
}

function HomeStructuredData({
  totalClinics,
  regions,
}: HomeStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["WebSite", "MedicalWebPage"],
    name: "FysFinder",
    url: "https://fysfinder.dk",
    about: {
      "@type": "MedicalSpecialty",
      name: "Fysioterapi",
      relevantSpecialty: {
        "@type": "MedicalSpecialty",
        name: "Physical Therapy",
      },
    },
    description: "Find den bedste fysioterapeut tæt på dig",
    specialty: "Fysioterapi",
    medicalAudience: "Patienter der søger fysioterapi",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://fysfinder.dk/{search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": ["Organization", "MedicalOrganization"],
      name: "FysFinder",
      url: "https://fysfinder.dk",
      description: `Danmarks største oversigt over fysioterapeuter med ${totalClinics} klinikker`,
      medicalSpecialty: ["Fysioterapi", "Physical Therapy"],
      areaServed: regions.map((region) => ({
        "@type": "State",
        name: region.name,
        containsPlace: region.cities.map((city) => ({
          "@type": "City",
          name: city.bynavn,
          containsPlace: {
            "@type": ["LocalBusiness", "MedicalClinic"],
            name: `Fysioterapeuter i ${city.bynavn}`,
            numberOfItems: city.clinic_count,
            medicalSpecialty: "Physical Therapy",
            address: {
              "@type": "PostalAddress",
              addressLocality: city.bynavn,
              addressCountry: "DK",
            },
          },
        })),
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

export const metadata: Metadata = {
  title: "Find den bedste fysioterapeut tæt på dig - Fysfinder",
  description:
    "Find din næste fysioterapeut med FysFinder. Få et fuldt overblik over klinikker nær dig og book din behandling i dag.",
};

export default async function HomePage() {
  try {
    const cities = await fetchCitiesWithCounts();
    const regions = processCities(cities);
    const totalClinics = cities.reduce(
      (sum, city) => sum + city.clinic_count,
      0
    );

    const specialties = await fetchSpecialties();

    return (
      <div>
        <HomeStructuredData totalClinics={totalClinics} regions={regions} />
        <Header totalClinics={totalClinics} specialties={specialties} />
        <BenefitsSection />
        <div className="max-w-6xl mx-auto px-4">
          <RegionList regions={regions} />
          <FAQ />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return (
      <div className="text-red-500 font-bold text-center py-10">
        Error loading cities: {(error as Error).message}
      </div>
    );
  }
}
