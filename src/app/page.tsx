import React from "react";
import Link from "next/link";
import { slugify } from "./utils/slugify";
import { createClient } from "@/app/utils/supabase/server";
import { Metadata } from "next";

interface Clinic {
  id: number;
  lokation: string;
  postnummer: string;
}

interface SuburbCount {
  suburb: string;
  count: number;
  postnummer: string;
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
    .select("id, lokation, postnummer");

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch clinics: ${error.message}`);
  }

  return data as Clinic[];
}

function processSuburbs(clinics: Clinic[]): RegionData[] {
  const suburbCounts = clinics.reduce((acc, { lokation, postnummer }) => {
    if (lokation && lokation.toLowerCase() !== "null" && postnummer) {
      const key = `${lokation}-${postnummer}`;
      acc[key] = (acc[key] || {
        suburb: lokation,
        count: 0,
        postnummer,
      }) as SuburbCount;
      acc[key].count++;
    }
    return acc;
  }, {} as Record<string, SuburbCount>);

  const sortedSuburbs = Object.values(suburbCounts).sort(
    (a, b) => b.count - a.count
  );

  return Object.entries(regions).map(([key, { name, range }]) => ({
    name,
    suburbs: sortedSuburbs.filter(({ postnummer }) => {
      const postNum = parseInt(postnummer);
      return postNum >= range[0] && postNum <= range[1];
    }),
  }));
}

function Header({ totalClinics }: { totalClinics: number }) {
  return (
    <div className="bg-logo-blue text-white py-20 px-4 mb-12 rounded-lg">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Find den bedste fysioterapeut
        </h1>
        <p className="text-xl">
          Vi har information fra {totalClinics} danske klinikker. Hvor leder du
          efter en fys?
        </p>
      </div>
    </div>
  );
}

function RegionNavigation() {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Hvor leder du efter fysioterapeut?
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {Object.entries(regions).map(([key, { name }]) => (
          <a
            key={key}
            href={`#${key}`}
            className="bg-logo-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            {name}
          </a>
        ))}
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
        <Header totalClinics={clinics.length} />
        <div className="max-w-6xl mx-auto px-4">
          <RegionNavigation />
          {regionData.map((region) => (
            <RegionSection key={region.name} region={region} />
          ))}
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
