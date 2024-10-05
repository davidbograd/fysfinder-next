import React from "react";
import Link from "next/link";
import { slugify, deslugify } from "./utils/slugify";
import { createClient } from "@/app/utils/supabase/server";
import { Metadata } from "next";

interface Clinic {
  id: number;
  lokation: string;
}

interface SuburbCount {
  suburb: string;
  count: number;
}

async function fetchClinics() {
  const supabase = createClient();
  const { data, error } = await supabase.from("clinics").select("id, lokation");

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch clinics: ${error.message}`);
  }

  return data as Clinic[];
}

function processSuburbs(clinics: Clinic[]): SuburbCount[] {
  const suburbCounts = clinics.reduce((acc, { lokation }) => {
    if (lokation && lokation.toLowerCase() !== "null") {
      acc[lokation] = (acc[lokation] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(suburbCounts)
    .map(([suburb, count]) => ({ suburb, count }))
    .sort((a, b) => b.count - a.count); // Sort by count in descending order
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

function SuburbList({ suburbs }: { suburbs: SuburbCount[] }) {
  return (
    <ul className="space-y-4">
      {suburbs.map(({ suburb, count }) => (
        <li key={suburb}>
          <Link
            href={`/${slugify(suburb)}`}
            className="block bg-white border p-6 rounded-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">
                {suburb}
              </span>
              <span className="text-slate-600">{count} klinikker</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
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
    const suburbs = processSuburbs(clinics);

    return (
      <div>
        <Header totalClinics={clinics.length} />
        <div className="max-w-4xl mx-auto px-4">
          <SuburbList suburbs={suburbs} />
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
