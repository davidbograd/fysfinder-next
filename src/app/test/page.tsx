import React from "react";
import { createClient } from "@/app/utils/supabase/server";

interface Specialty {
  specialty_name: string;
}

interface Clinic {
  clinics_id: string;
  klinikNavnSlug: string;
}

async function fetchClinicSpecialties(klinikNavnSlug: string) {
  const supabase = createClient();

  // First, fetch the clinic ID based on the klinikNavnSlug
  const { data: clinicData, error: clinicError } = await supabase
    .from("clinics")
    .select("clinics_id")
    .eq("klinikNavnSlug", klinikNavnSlug)
    .single();

  if (clinicError) {
    console.error("Supabase error fetching clinic:", clinicError);
    throw new Error(`Failed to fetch clinic: ${clinicError.message}`);
  }

  if (!clinicData) {
    throw new Error(`No clinic found with slug: ${klinikNavnSlug}`);
  }

  // Now fetch the specialties for this clinic
  const { data: specialtiesData, error: specialtiesError } = await supabase
    .from("clinic_specialties")
    .select(
      `
      specialties (
        specialty_name
      )
    `
    )
    .eq("clinic_id", clinicData.clinics_id);

  if (specialtiesError) {
    console.error("Supabase error fetching specialties:", specialtiesError);
    throw new Error(
      `Failed to fetch clinic specialties: ${specialtiesError.message}`
    );
  }

  return specialtiesData?.map((item) => item.specialties as Specialty) || [];
}

export default async function TestPage() {
  const klinikNavnSlug = "fysiopuls";
  let specialties: Specialty[] = [];
  let errorMessage: string | null = null;

  try {
    specialties = await fetchClinicSpecialties(klinikNavnSlug);
    console.log("Fetched specialties:", specialties);
  } catch (error) {
    console.error("Error in TestPage:", error);
    errorMessage = (error as Error).message;
  }

  // Get unique specialty names
  const specialtyNames = Array.from(
    new Set(specialties.map((specialty) => specialty.specialty_name))
  )
    .filter((name) => name && name.toLowerCase() !== "null")
    .sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Clinic Specialties</h1>
      <p className="mb-4">Clinic Slug: {klinikNavnSlug}</p>
      {errorMessage ? (
        <p className="text-red-500">Error: {errorMessage}</p>
      ) : specialtyNames.length > 0 ? (
        <ul className="list-disc pl-5">
          {specialtyNames.map((name) => (
            <li key={name} className="mb-2">
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No specialties found for this clinic.</p>
      )}
    </div>
  );
}
