import React from "react";
import { createClient } from "@/app/utils/supabase/server";
import Link from "next/link";
import { slugify } from "@/app/utils/slugify";

interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  lokationSlug: string;
  klinikNavnSlug: string;
}

async function searchClinics(searchTerm: string): Promise<Clinic[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clinics")
    .select("clinics_id, klinikNavn, lokationSlug, klinikNavnSlug")
    .ilike("klinikNavn", `%${searchTerm}%`)
    .order("klinikNavn", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to search clinics: ${error.message}`);
  }

  return data || [];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const searchTerm = searchParams.q || "";
  let clinics: Clinic[] = [];
  let errorMessage: string | null = null;

  if (searchTerm) {
    try {
      clinics = await searchClinics(searchTerm);
    } catch (error) {
      console.error("Error in SearchPage:", error);
      errorMessage = (error as Error).message;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Search Clinics</h1>
      <form className="mb-8">
        <input
          type="text"
          name="q"
          defaultValue={searchTerm}
          placeholder="Search for a clinic..."
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </form>
      {errorMessage ? (
        <p className="text-red-500">Error: {errorMessage}</p>
      ) : searchTerm ? (
        clinics.length > 0 ? (
          <ul className="space-y-4">
            {clinics.map((clinic) => (
              <li key={clinic.clinics_id} className="border p-4 rounded">
                <Link
                  href={`/${clinic.lokationSlug}/${clinic.klinikNavnSlug}`}
                  className="text-blue-500 hover:underline"
                >
                  {clinic.klinikNavn}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No clinics found matching "{searchTerm}"</p>
        )
      ) : null}
    </div>
  );
}
