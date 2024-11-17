import React from "react";
import Link from "next/link";
import { slugify } from "./utils/slugify";
import { createClient } from "@/app/utils/supabase/server";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/components/FAQ";

interface Clinic {
  clinics_id: string;
  lokation: string;
  postnummer: string;
}

interface SuburbCount {
  suburb: string;
  count: number;
}

interface RegionData {
  name: string;
  suburbs: SuburbCount[];
}

const regions: { [key: string]: { name: string; range: [number, number] } } = {
  hovedstaden: { name: "Hovedstaden", range: [1000, 2999] },
  sjaelland: { name: "Sjælland", range: [3000, 4999] },
  syddanmark: { name: "Syddanmark", range: [5000, 6999] },
  midtjylland: { name: "Midtjylland", range: [7000, 8999] },
  nordjylland: { name: "Nordjylland", range: [9000, 9999] },
};

async function fetchClinics() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clinics")
    .select("clinics_id, lokation, postnummer");

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch clinics: ${error.message}`);
  }

  return data as Clinic[];
}

function processSuburbs(clinics: Clinic[]): RegionData[] {
  const suburbCounts = clinics.reduce((acc, { lokation, postnummer }) => {
    if (lokation && lokation.toLowerCase() !== "null") {
      const key = lokation.toLowerCase();
      if (!acc[key]) {
        acc[key] = {
          suburb: lokation,
          count: 0,
          postnummer: postnummer, // Keep one postnummer for region determination
        };
      }
      acc[key].count++;
    }
    return acc;
  }, {} as Record<string, SuburbCount & { postnummer: string }>);

  const sortedSuburbs = Object.values(suburbCounts).sort(
    (a, b) => b.count - a.count
  );

  return Object.entries(regions).map(([key, { name, range }]) => ({
    name,
    suburbs: sortedSuburbs
      .filter(({ postnummer }) => {
        const postNum = parseInt(postnummer);
        return postNum >= range[0] && postNum <= range[1];
      })
      .map(({ suburb, count }) => ({ suburb, count })), // Remove postnummer from final output
  }));
}

function Header({ totalClinics }: { totalClinics: number }) {
  return (
    <div className="bg-logo-blue text-white py-10 sm:py-20 px-4 mb-8 sm:mb-12 rounded-lg">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
          Find den bedste fysioterapeut
        </h1>
        <p className="text-base sm:text-lg mb-6 sm:mb-8 text-white/90">
          Leder du efter en fysioterapeut? Vi har information fra {totalClinics}{" "}
          danske klinikker. FysFinder har anmeldelser, specialer, priser og
          meget mere. Find den perfekte fysioterapeut til dit behov.
        </p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {Object.entries(regions).map(([key, { name }]) => (
            <Button key={key} variant="secondary" asChild>
              <a href={`#${key}`}>{name}</a>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SuburbGrid({ suburbs }: { suburbs: SuburbCount[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {suburbs.map(({ suburb, count }) => (
        <Link
          key={suburb}
          href={`/${slugify(suburb)}`}
          className="block bg-white border p-4 rounded-md hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-slate-800">{suburb}</span>
            <span className="text-slate-600">{count} klinikker</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function RegionSection({ region }: { region: RegionData }) {
  return (
    <section id={slugify(region.name)} className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{region.name}</h2>
      <SuburbGrid suburbs={region.suburbs} />
    </section>
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
        containsPlace: region.suburbs.map((suburb) => ({
          "@type": "City",
          name: suburb.suburb,
          containsPlace: {
            "@type": ["LocalBusiness", "MedicalClinic"],
            name: `Fysioterapeuter i ${suburb.suburb}`,
            numberOfItems: suburb.count,
            medicalSpecialty: "Physical Therapy",
            address: {
              "@type": "PostalAddress",
              addressLocality: suburb.suburb,
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
    const clinics = await fetchClinics();
    const regionData = processSuburbs(clinics);

    return (
      <div>
        <HomeStructuredData
          totalClinics={clinics.length}
          regions={regionData}
        />
        <Header totalClinics={clinics.length} />
        <div className="max-w-6xl mx-auto px-4">
          {regionData.map((region) => (
            <RegionSection key={region.name} region={region} />
          ))}
          <FAQ />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return (
      <div className="text-red-500 font-bold text-center py-10">
        Error loading clinics: {(error as Error).message}
      </div>
    );
  }
}
