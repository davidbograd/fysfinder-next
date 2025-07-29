import { Metadata } from "next";
import { notFound } from "next/navigation";
import LocationPage, { fetchSpecialties, fetchLocationData } from "../page";
import { SpecialtyWithSeo } from "@/app/types";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { location: string; specialty: string };
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  // Parse filter parameters for metadata (with safety check)
  const filters: { ydernummer?: boolean; handicap?: boolean } = {};
  if (searchParams?.ydernummer === "true") filters.ydernummer = true;
  if (searchParams?.handicap === "true") filters.handicap = true;

  const data = await fetchLocationData(
    params.location,
    params.specialty,
    filters
  );
  const specialties = data.specialties;
  const specialty = specialties.find(
    (s: SpecialtyWithSeo) => s.specialty_name_slug === params.specialty
  );

  if (!specialty) return notFound();

  // Build filter context for titles
  const filterContext = [];
  if (filters.ydernummer) filterContext.push("med ydernummer");
  if (filters.handicap) filterContext.push("med handicapadgang");
  const filterSuffix =
    filterContext.length > 0 ? ` (${filterContext.join(" og ")})` : "";

  // For danmark pages
  if (params.location === "danmark") {
    return {
      title: `${specialty.specialty_name} fysioterapi i Danmark${filterSuffix} | Find fysioterapeuter ›`,
      description: `Find ${specialty.specialty_name.toLowerCase()} fysioterapeuter i Danmark${filterSuffix.toLowerCase()}. Se anmeldelser, priser og book tid online. Start her →`,
    };
  }

  // For city pages
  if (!data.city) return notFound();

  return {
    title: `${specialty.specialty_name} fysioterapi i ${data.city.bynavn}${filterSuffix} | Find fysioterapeuter ›`,
    description: `Find ${specialty.specialty_name.toLowerCase()} fysioterapeuter i ${
      data.city.bynavn
    }${filterSuffix.toLowerCase()}. Se anmeldelser, priser og book tid online. Start her →`,
  };
}

export default function SpecialtyPage({
  params,
  searchParams,
}: {
  params: { location: string; specialty: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <LocationPage params={params} searchParams={searchParams} />;
}
