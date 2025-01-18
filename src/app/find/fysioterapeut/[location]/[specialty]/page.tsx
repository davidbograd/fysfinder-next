import { Metadata } from "next";
import { notFound } from "next/navigation";
import LocationPage, { fetchSpecialties, fetchCity } from "../page";
import { createClient } from "@supabase/supabase-js";
import { slugify } from "@/app/utils/slugify";
import { CityRow, SpecialtyRow } from "@/app/types";
import { SpecialtyStructuredData } from "@/app/components/SpecialtyStructuredData";

export async function generateMetadata({
  params,
}: {
  params: { location: string; specialty: string };
}): Promise<Metadata> {
  const city = await fetchCity(params.location);
  const specialties = await fetchSpecialties();
  const specialty = specialties.find(
    (s) => s.specialty_name_slug === params.specialty
  );

  if (!city || !specialty) return notFound();

  return {
    title: `${specialty.specialty_name} fysioterapi i ${city.bynavn} | Find fysioterapeuter ›`,
    description: `Find ${specialty.specialty_name.toLowerCase()} fysioterapeuter i ${
      city.bynavn
    }. Se anmeldelser, priser og book tid online. Start her →`,
  };
}

export default function SpecialtyPage({
  params,
}: {
  params: { location: string; specialty: string };
}) {
  console.log("SpecialtyPage params before passing:", params);

  // Force isDanmark to true when location is danmark
  const enhancedParams = {
    ...params,
    isDanmark: params.location.toLowerCase() === "danmark",
  };

  return <LocationPage params={enhancedParams} />;
}
