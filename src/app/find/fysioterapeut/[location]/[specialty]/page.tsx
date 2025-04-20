import { Metadata } from "next";
import { notFound } from "next/navigation";
import LocationPage, { fetchSpecialties, fetchLocationData } from "../page";
import { SpecialtyWithSeo } from "@/app/types";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

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

export default async function SpecialtyPage({
  params,
}: {
  params: { location: string; specialty: string };
}) {
  const data = await fetchLocationData(params.location, params.specialty);
  const specialty = data.specialties.find(
    (s: SpecialtyWithSeo) => s.specialty_name_slug === params.specialty
  );

  if (!specialty || !data.city) return notFound();

  // Create breadcrumb items including the specialty
  const breadcrumbItems = [
    { text: "Forside", link: "/" },
    { text: data.city.bynavn, link: `/find/fysioterapeut/${params.location}` },
    { text: specialty.specialty_name },
  ];

  return (
    <LocationPage
      params={params}
      customBreadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
    />
  );
}
