"use server";

import { createClient } from "@/app/utils/supabase/server";

export interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  lokationSlug: string;
  klinikNavnSlug: string;
}

export async function searchClinics(searchTerm: string): Promise<Clinic[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinics")
    .select("clinics_id, klinikNavn, lokationSlug, klinikNavnSlug")
    .ilike("klinikNavn", `%${searchTerm}%`)
    .order("klinikNavn", { ascending: true });

  if (error) {
    console.error("Supabase fejl:", error);
    throw new Error(`Kunne ikke søge efter klinikker: ${error.message}`);
  }

  return data || [];
}
