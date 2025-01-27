import React from "react";
import Link from "next/link";
import { slugify } from "./utils/slugify";
import { createClient } from "@/app/utils/supabase/server";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FAQ } from "@/components/FAQ";
import { SearchAndFilters } from "@/app/components/SearchAndFilters";
import { RegionList } from "@/app/components/RegionList";

interface CityWithCount {
  id: string;
  bynavn: string;
  bynavn_slug: string;
  postal_codes: string[];
  clinic_count: number;
}

interface RegionData {
  name: string;
  cities: CityWithCount[];
}

const regions: { [key: string]: { name: string; range: [number, number] } } = {
  hovedstaden: { name: "Hovedstaden", range: [1000, 2999] },
  sjaelland: { name: "Sjælland", range: [3000, 4999] },
  syddanmark: { name: "Syddanmark", range: [5000, 6999] },
  midtjylland: { name: "Midtjylland", range: [7000, 8999] },
  nordjylland: { name: "Nordjylland", range: [9000, 9999] },
};

async function fetchCitiesWithCounts() {
  const supabase = createClient();

  const { data, error } = await supabase.from("cities").select(`
      id,
      bynavn,
      bynavn_slug,
      postal_codes,
      clinics:clinics(count)
    `);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch cities: ${error.message}`);
  }

  return data.map((city) => ({
    id: city.id,
    bynavn: city.bynavn,
    bynavn_slug: city.bynavn_slug,
    postal_codes: city.postal_codes,
    clinic_count: city.clinics?.[0]?.count ?? 0,
  })) as CityWithCount[];
}

async function fetchSpecialties() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("specialties")
    .select("specialty_id, specialty_name, specialty_name_slug");

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch specialties: ${error.message}`);
  }

  return data;
}

function processCities(cities: CityWithCount[]): RegionData[] {
  return Object.entries(regions).map(([key, { name, range }]) => ({
    name,
    cities: cities
      .filter((city) => {
        return city.postal_codes.some((postalCode) => {
          const postNum = parseInt(postalCode);
          return postNum >= range[0] && postNum <= range[1];
        });
      })
      .sort((a, b) => b.clinic_count - a.clinic_count),
  }));
}

function Header({
  totalClinics,
  specialties,
}: {
  totalClinics: number;
  specialties: Array<{
    specialty_id: string;
    specialty_name: string;
    specialty_name_slug: string;
  }>;
}) {
  return (
    <div className="bg-logo-blue py-10 sm:py-20 px-4 mb-8 sm:mb-12 rounded-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white text-center">
          Find den bedste fysioterapeut
        </h1>

        <div className="max-w-2xl mx-auto">
          <SearchAndFilters
            specialties={specialties}
            defaultSearchValue=""
            citySlug="danmark"
          />
        </div>
        <p className="text-base sm:text-lg text-white/90 text-center">
          Se anmeldelser, specialer, priser og meget mere på {totalClinics}{" "}
          danske klinikker.
        </p>
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
    const [cities, specialties] = await Promise.all([
      fetchCitiesWithCounts(),
      fetchSpecialties(),
    ]);

    const regionData = processCities(cities);
    const totalClinics = cities.reduce(
      (sum, city) => sum + city.clinic_count,
      0
    );

    return (
      <div>
        <HomeStructuredData totalClinics={totalClinics} regions={regionData} />
        <Header totalClinics={totalClinics} specialties={specialties} />
        <div className="max-w-6xl mx-auto px-4">
          <RegionList regions={regionData} />
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
