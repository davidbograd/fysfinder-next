import React from "react";
import Link from "next/link";
import { createClient } from "@/app/utils/supabase/server";
import ClinicCard from "../components/ClinicCard";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { deslugify, slugify } from "../utils/slugify";
import { Metadata } from "next";

interface Clinic {
  id: number;
  klinikNavn: string;
  antalBehandlere: number;
  ydernummer: string;
  avgRating: number;
  ratingCount: number;
  lokation: string;
}

async function fetchClinicsBySuburb(suburb: string): Promise<Clinic[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("lokation", suburb);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch clinics: ${error.message}`);
  }

  return data as Clinic[];
}

async function getClinicCount(suburb: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("clinics")
    .select("*", { count: "exact", head: true })
    .eq("lokation", suburb);

  if (error) {
    console.error("Error fetching clinic count:", error);
    return 0;
  }

  return count || 0;
}

export async function generateMetadata({
  params,
}: {
  params: { suburb: string };
}): Promise<Metadata> {
  const decodedSuburb = deslugify(params.suburb);
  const clinicCount = await getClinicCount(decodedSuburb);

  return {
    title: `Find Fysioterapeut i ${decodedSuburb} - FysFinder`,
    description: `Find ${decodedSuburb}s bedste fysioterapeut. FysFinder giver dig overblik over ${clinicCount} fysioterapiklinikker i ${decodedSuburb}.`,
  };
}

export default async function SuburbPage({
  params,
}: {
  params: { suburb: string };
}) {
  try {
    const decodedSuburb = deslugify(decodeURIComponent(params.suburb));
    const clinics = await fetchClinicsBySuburb(decodedSuburb);

    const breadcrumbItems = [
      { text: "Forside", link: "/" },
      { text: decodedSuburb },
    ];

    return (
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} />
        {clinics.length === 0 ? (
          <div className="text-center py-10">
            <h1 className="text-3xl font-bold mb-4">Ingen klinikker fundet</h1>
            <p className="text-xl">
              Der er desværre ingen klinikker registreret i {decodedSuburb}.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Gå tilbage til forsiden
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6">
              {clinics.length} bedste fysioterapeuter i {decodedSuburb}
            </h1>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {clinics.map((clinic) => (
                <Link
                  key={clinic.id}
                  href={`/${params.suburb}/${slugify(clinic.klinikNavn)}`}
                >
                  <ClinicCard
                    klinikNavn={clinic.klinikNavn}
                    antalBehandlere={clinic.antalBehandlere}
                    ydernummer={clinic.ydernummer}
                    avgRating={clinic.avgRating}
                    ratingCount={clinic.ratingCount}
                  />
                </Link>
              ))}
            </div>
          </>
        )}
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
