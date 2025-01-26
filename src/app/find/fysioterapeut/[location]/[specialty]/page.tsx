import { Metadata } from "next";
import { notFound } from "next/navigation";
import LocationPage, { fetchSpecialties, fetchLocationData } from "../page";
import { SpecialtyWithSeo } from "@/app/types";

export async function generateMetadata({
  params,
}: {
  params: { location: string; specialty: string };
}): Promise<Metadata> {
  const data = await fetchLocationData(params.location, params.specialty);
  const specialties = data.specialties;
  const specialty = specialties.find(
    (s: SpecialtyWithSeo) => s.specialty_name_slug === params.specialty
  );

  if (!specialty) return notFound();

  // For danmark pages
  if (params.location === "danmark") {
    return {
      title: `${specialty.specialty_name} fysioterapi i Danmark | Find fysioterapeuter ›`,
      description: `Find ${specialty.specialty_name.toLowerCase()} fysioterapeuter i Danmark. Se anmeldelser, priser og book tid online. Start her →`,
    };
  }

  // For city pages
  if (!data.city) return notFound();

  return {
    title: `${specialty.specialty_name} fysioterapi i ${data.city.bynavn} | Find fysioterapeuter ›`,
    description: `Find ${specialty.specialty_name.toLowerCase()} fysioterapeuter i ${
      data.city.bynavn
    }. Se anmeldelser, priser og book tid online. Start her →`,
  };
}

export default function SpecialtyPage({
  params,
}: {
  params: { location: string; specialty: string };
}) {
  return <LocationPage params={params} />;
}
