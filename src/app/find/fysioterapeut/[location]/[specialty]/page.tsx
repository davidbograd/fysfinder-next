import { Metadata } from "next";
import { notFound } from "next/navigation";
import LocationPage, { fetchLocationData } from "../page";
import { SpecialtyWithSeo } from "@/app/types";
import { generateMetaTitle } from "@/lib/headers-and-metatitles";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ location: string; specialty: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  // Resolve params and searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Parse filter parameters for metadata (with safety check)
  const filters: { ydernummer?: boolean; handicap?: boolean } = {};
  if (resolvedSearchParams?.ydernummer === "true") filters.ydernummer = true;
  if (resolvedSearchParams?.handicap === "true") filters.handicap = true;

  const data = await fetchLocationData(
    resolvedParams.location,
    resolvedParams.specialty,
    filters
  );
  const specialties = data.specialties;
  const specialty = specialties.find(
    (s: SpecialtyWithSeo) => s.specialty_name_slug === resolvedParams.specialty
  );

  if (!specialty) return notFound();

  // Generate location name
  const locationName =
    resolvedParams.location === "danmark" ? "Danmark" : data.city?.bynavn;
  if (!locationName) return notFound();

  // Generate dynamic meta title using our new utility
  const title = generateMetaTitle(
    locationName,
    specialty.specialty_name,
    filters
  );

  // Build filter context for description
  const filterContext = [];
  if (filters.ydernummer) filterContext.push("med ydernummer");
  if (filters.handicap) filterContext.push("med handicapadgang");
  const filterSuffix =
    filterContext.length > 0 ? ` (${filterContext.join(" og ")})` : "";

  return {
    title,
    description: `Find ${specialty.specialty_name.toLowerCase()} fysioterapeuter i ${locationName}${filterSuffix.toLowerCase()}. Se anmeldelser, priser og book tid online. Start her →`,
  };
}

export default async function SpecialtyPage({
  params,
  searchParams,
}: {
  params: Promise<{ location: string; specialty: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <LocationPage params={params} searchParams={searchParams} />;
}
