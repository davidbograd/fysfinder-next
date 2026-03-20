// Homepage component with graceful error handling
// Updated: 2026-03-17 - Tightened homepage visual polish to better match screenshot layout while preserving existing data flow and structured SEO data

import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { FAQ } from "@/components/features/blog-og-ordbog/FAQ";
import { SearchInterface } from "@/components/search/SearchInterface";
import { RegionList } from "@/components/features/search/RegionList";
import {
  fetchCitiesWithCounts,
  fetchSpecialties,
  processCities,
  type CityWithCount,
  type RegionData,
  type Specialty,
} from "./utils/cityUtils";
export const revalidate = 21600; // 6 hours ISR (must be a literal for Next.js segment config)

const regions: { [key: string]: { name: string; range: [number, number] } } = {
  hovedstaden: { name: "Hovedstaden", range: [1000, 2999] },
  sjaelland: { name: "Sjælland", range: [3000, 4999] },
  syddanmark: { name: "Syddanmark", range: [5000, 6999] },
  midtjylland: { name: "Midtjylland", range: [7000, 8999] },
  nordjylland: { name: "Nordjylland", range: [9000, 9999] },
};

function HeroSection({
  totalClinics,
  specialties,
}: {
  totalClinics: number;
  specialties: Specialty[];
}) {
  return (
    <section className="relative mt-0 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[#f2f1ec] border-b border-[#e3e1d8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-10 sm:pb-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px] items-start">
          <div className="space-y-5">
          <div className="space-y-3">
            <h1 className="text-[40px] leading-tight md:text-[56px] md:leading-[1.08] font-normal tracking-tight text-[#1f2b28]">
              Find den bedste fysioterapeut
            </h1>
            <p className="text-[20px] leading-snug text-[#3f4b48] max-w-2xl lg:max-w-none lg:whitespace-nowrap">
              Søg blandt tusindvis af fysioterapeuter i hele Danmark. Find den
              rette behandling tæt på dig.
            </p>
          </div>
          <div className="py-4">
            <SearchInterface
              specialties={specialties}
              defaultSearchValue=""
              citySlug="danmark"
              showFilters={false}
              initialFilters={{}}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
            <div>
              <p className="text-[20px] font-medium text-[#1f2b28] leading-snug">
                {totalClinics.toLocaleString("da-DK")}
                <span className="ml-2 text-[18px] font-normal text-brand-label sm:ml-0 sm:block">
                  fysioterapi klinikker
                </span>
              </p>
            </div>
            <div>
              <p className="text-[20px] font-medium text-[#1f2b28] leading-snug">
                {specialties.length}
                <span className="ml-2 text-[18px] font-normal text-brand-label sm:ml-0 sm:block">
                  behandling specialer
                </span>
              </p>
            </div>
            <div>
              <p className="text-[20px] font-medium text-[#1f2b28] leading-snug">
                Over 5.500
                <span className="ml-2 text-[18px] font-normal text-brand-label sm:ml-0 sm:block">
                  bruger FysFinder månedlig
                </span>
              </p>
            </div>
          </div>
          </div>
          <div className="hidden lg:block relative h-[230px]">
            <div className="absolute top-0 right-0 w-44 h-36 rounded-xl bg-[#1f2b28] shadow-md p-3 flex items-end text-white text-xs">
              Ekspertprofil
            </div>
            <div className="absolute top-10 left-3 w-36 h-30 rounded-xl bg-[#2f6d5b] shadow-md p-3 flex items-end text-white text-xs">
              Verificeret
            </div>
            <div className="absolute bottom-0 right-12 w-40 h-34 rounded-xl bg-[#d7dfdb] shadow-md p-3 flex items-end text-[#1f2b28] text-xs">
              Top anmeldt
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuePropsSection() {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-[2rem] font-semibold text-[#1f2b28] leading-tight">
          Find den rette fysioterapeut, lettere
        </h2>
        <p className="text-[#5a6663] mt-2">
          Vi guider dig til bedre overblik, hurtigere valg og tryggere behandling.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <article className="rounded-xl border border-[#e3e1d8] bg-[#f3f1ea] p-6 min-h-[230px] overflow-hidden">
          <h3 className="text-2xl font-medium text-[#1f2b28]">
            Specialiseret efter dit behov
          </h3>
          <p className="text-[#5a6663] mt-3 max-w-md">
            Filtrer på specialer og find klinikker, der matcher netop din skade,
            udfordring eller behandlingsform.
          </p>
          <div className="mt-5 h-16 w-36 rounded-full bg-[#d4a26f]" />
        </article>
        <article className="rounded-xl border border-[#e3e1d8] bg-[#e9e9e7] p-6 min-h-[230px]">
          <p className="text-[#cb3a33] font-semibold">WIP</p>
          <h3 className="text-xl font-medium text-[#1f2b28] mt-2">
            Find den rette behandler
          </h3>
          <p className="text-[#5a6663] mt-3">
            Skab overblik over erfaring, specialer og lokation, så du kan vælge
            med ro i maven.
          </p>
        </article>
      </div>
    </section>
  );
}

function PartnerStrip() {
  return (
    <section className="rounded-xl border border-[#e3e1d8] bg-[#f3f1ea] p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-[#5a6663] text-sm">Foreninger der anbefaler FysFinder</p>
        <div className="flex flex-wrap items-center gap-8 text-[#1f2b28] font-semibold tracking-wide">
          <span>FAKS</span>
          <span>Hovedpineforeningen</span>
        </div>
      </div>
    </section>
  );
}

const specialtyTeasers = [
  { label: "Knæ", href: "/find/fysioterapeut/danmark/knae" },
  { label: "Ryg", href: "/find/fysioterapeut/danmark/ryg" },
  { label: "Skulder", href: "/find/fysioterapeut/danmark/skulder" },
  { label: "Gyn-obs", href: "/find/fysioterapeut/danmark/gyn-obs" },
  { label: "Hypermobilitet", href: "/find/fysioterapeut/danmark/hypermobilitet" },
  { label: "Parkinson", href: "/find/fysioterapeut/danmark/parkinson" },
  { label: "Skoliose", href: "/find/fysioterapeut/danmark/skoliose" },
];

function SpecialtyTeasers() {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-[#1f2b28] mb-4">
        Find fysioterapeut efter speciale
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {specialtyTeasers.map((specialty) => (
          <Link
            key={specialty.href}
            href={specialty.href}
            className="rounded-lg border border-[#dfe3de] overflow-hidden bg-white hover:shadow-sm transition-shadow"
          >
            <div className="h-16 bg-[linear-gradient(130deg,#9ab3ac,#d7dfdb)]" />
            <p className="text-base font-medium text-[#1f2b28] text-center py-3">
              {specialty.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ClinicCtaSection() {
  return (
    <section className="rounded-xl border border-[#e3e1d8] bg-white overflow-hidden">
      <div className="grid md:grid-cols-2">
        <div className="min-h-[240px] bg-[linear-gradient(135deg,#082e53,#214f7b,#aac8d6)]" />
        <div className="p-6 md:p-8">
          <p className="text-[#cb3a33] font-semibold">WIP</p>
          <h3 className="text-2xl font-semibold text-[#1f2b28] mt-2">
            Få flere patienter og fyld din kalender
          </h3>
          <ul className="text-[#5a6663] mt-4 space-y-2 text-sm">
            <li>- Bliv fundet af patienter med relevante behov</li>
            <li>- Synliggør jeres specialer og kompetencer</li>
            <li>- Skab en stærk digital tilstedeværelse</li>
          </ul>
          <Link
            href="/tilmeld"
            className="inline-flex mt-6 rounded-full bg-[#0b5b43] px-6 py-2.5 text-white text-sm font-medium hover:bg-[#084c39] transition-colors"
          >
            Kom i gang
          </Link>
        </div>
      </div>
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

function ErrorFallback() {
  return (
    <section className="rounded-2xl bg-[#f2f1ec] border border-[#e3e1d8] p-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold text-[#1f2b28]">
          Find den bedste fysioterapeut
        </h1>
        <div className="bg-white rounded-xl p-6 border border-[#e3e1d8] mt-6">
          <div className="space-y-3">
            <p className="text-[#1f2b28] text-lg">
              Vi har midlertidigt problemer med at hente data.
            </p>
            <p className="text-[#5a6663]">
              Prøv venligst at genindlæse siden om et øjeblik.
            </p>
            <Link
              href="/"
              className="inline-flex items-center rounded-full px-6 py-2.5 bg-[#0b5b43] hover:bg-[#084c39] text-white font-medium transition-colors"
            >
              Genindlæs siden
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  try {
    const cities = await fetchCitiesWithCounts();
    const regions = processCities(cities);
    const totalClinics = cities.reduce(
      (sum: number, city: { clinic_count: number }) => sum + city.clinic_count,
      0
    );

    const specialties = await fetchSpecialties();

    return (
      <>
        <HomeStructuredData totalClinics={totalClinics} regions={regions} />
        <div className="space-y-20 pb-8">
          <HeroSection totalClinics={totalClinics} specialties={specialties} />
          <ValuePropsSection />
          <PartnerStrip />
          <SpecialtyTeasers />
          <div>
            <h2 className="text-2xl font-semibold text-[#1f2b28] mb-4">
              Find fysioterapeut efter område
            </h2>
            <RegionList regions={regions} />
          </div>
          <ClinicCtaSection />
          <div>
            <FAQ />
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Homepage data fetch error:", error);
    // Return a graceful fallback UI instead of breaking the page
    return (
      <div className="space-y-20 pb-8">
        <ErrorFallback />
        <ValuePropsSection />
        <div>
          <div className="bg-[#f3f1ea] border border-[#e3e1d8] rounded-lg p-8 text-center">
            <p className="text-[#5a6663]">
              Data kunne ikke indlæses. Prøv venligst igen senere.
            </p>
          </div>
          <FAQ />
        </div>
      </div>
    );
  }
}
