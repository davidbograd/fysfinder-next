import React from "react";
import { MeetTheTeam } from "@/app/components/MeetTheTeam";
import { createClient } from "@/app/utils/supabase/server";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { StarIcon } from "@heroicons/react/24/solid";
import GoogleMap from "../../components/GoogleMap";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ClinicSidebar } from "@/app/components/ClinicSidebar";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clinic, Insurance, ExtraService, TeamMember } from "@/app/types";

async function fetchClinicBySlug(clinicSlug: string): Promise<Clinic | null> {
  const supabase = createClient();

  try {
    const requestUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clinics?klinikNavnSlug=eq.${clinicSlug}&select=*,clinic_specialties(specialty:specialties(specialty_id,specialty_name,specialty_name_slug)),clinic_team_members(id,name,role,image_url,display_order),clinic_insurances(insurance:insurance_companies(insurance_id,insurance_name,insurance_name_slug)),clinic_services(service:extra_services(service_id,service_name,service_name_slug))`;

    const response = await fetch(requestUrl, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 86400, // Cache for 24 hours
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const clinic = data[0];

    // Initialize empty arrays for safety
    clinic.specialties = [];
    clinic.team_members = [];
    clinic.insurances = [];
    clinic.extraServices = [];

    // Safely handle specialties
    if (clinic.clinic_specialties && Array.isArray(clinic.clinic_specialties)) {
      clinic.specialties = clinic.clinic_specialties
        .filter((item: any) => item.specialty)
        .map((item: any) => item.specialty);
      delete clinic.clinic_specialties;
    }

    // Safely handle team members
    if (
      clinic.clinic_team_members &&
      Array.isArray(clinic.clinic_team_members)
    ) {
      clinic.team_members = clinic.clinic_team_members
        .filter((member: any) => member)
        .sort(
          (a: TeamMember, b: TeamMember) => a.display_order - b.display_order
        );
      delete clinic.clinic_team_members;
    }

    // Handle insurances
    if (clinic.clinic_insurances && Array.isArray(clinic.clinic_insurances)) {
      clinic.insurances = clinic.clinic_insurances
        .filter((item: any) => item.insurance)
        .map((item: any) => item.insurance);
      delete clinic.clinic_insurances;
    }

    // Handle extra services
    if (clinic.clinic_services && Array.isArray(clinic.clinic_services)) {
      clinic.extraServices = clinic.clinic_services
        .filter((item: any) => item.service)
        .map((item: any) => item.service);
      delete clinic.clinic_services;
    }

    return clinic;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { clinicName: string };
}): Promise<Metadata> {
  const clinic = await fetchClinicBySlug(params.clinicName);

  if (!clinic) {
    redirect("/");
  }

  return {
    title: `${clinic.klinikNavn} | Se detaljer`,
    description: `Se åbningstider, priser og behandlingstyper for ${clinic.klinikNavn}, ${clinic.lokation}.`,
  };
}

function hasAnyOpeningHours(clinic: Clinic): boolean {
  return [
    clinic.mandag,
    clinic.tirsdag,
    clinic.onsdag,
    clinic.torsdag,
    clinic.fredag,
    clinic.lørdag,
    clinic.søndag,
  ].some((day) => day !== null);
}

function hasAccessInfo(clinic: Clinic): boolean {
  return clinic.parkering !== null || clinic.handicapadgang !== null;
}

interface ClinicStructuredDataProps {
  clinic: Clinic;
}

function ClinicStructuredData({ clinic }: ClinicStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "MedicalBusiness", "PhysicalTherapist"],
    name: clinic.klinikNavn,
    url: `https://www.fysfinder.dk/klinik/${clinic.klinikNavnSlug}`,
    telephone: clinic.tlf,
    email: clinic.email,
    description: clinic.om_os || `Fysioterapi klinik i ${clinic.lokation}`,

    // Medical Organization Details
    medicalSpecialty: [
      "Physical Therapy",
      ...clinic.specialties.map((s) => s.specialty_name),
    ],
    healthcareReportingData: {
      "@type": "HealthcareReportingData",
      hasHealthPlanNetwork: clinic.ydernummer,
    },

    // Reviews and Ratings (only if clinic has ratings)
    ...(clinic.avgRating && clinic.ratingCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: clinic.avgRating,
            reviewCount: clinic.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),

    // Medical Services
    availableService: clinic.specialties.map((specialty) => ({
      "@type": "MedicalTherapy",
      name: specialty.specialty_name,
      description: `${specialty.specialty_name} behandling`,
    })),

    // Contact Points
    contactPoint: {
      "@type": "ContactPoint",
      telephone: clinic.tlf,
      email: clinic.email,
      contactType: "Customer Service",
    },

    // Location Information
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic.adresse,
      postalCode: clinic.postnummer,
      addressLocality: clinic.lokation,
      addressCountry: "DK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: clinic.lokation?.split(",")[0],
      longitude: clinic.lokation?.split(",")[1],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

function generateClinicDescription(clinic: Clinic): string {
  const parts = [];

  if (clinic.specialties?.length > 0) {
    parts.push(
      `Specialiseret i ${clinic.specialties
        .map((s) => s.specialty_name.toLowerCase())
        .join(", ")}`
    );
  }

  if (clinic.ydernummer) {
    parts.push(
      "Tilbyder behandling med tilskud fra den offentlige sygesikring"
    );
  }

  if (clinic.førsteKons) {
    parts.push(`Første konsultation fra ${clinic.førsteKons} kr`);
  }

  return parts.length > 0
    ? `${clinic.klinikNavn} i ${clinic.lokation}. ${parts.join(". ")}.`
    : `Fysioterapi klinik i ${clinic.lokation}`;
}

function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ text: string; link?: string }>;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": item.link ? `https://www.fysfinder.dk${item.link}` : "",
        name: item.text,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function ClinicPage({
  params,
}: {
  params: { clinicName: string };
}) {
  try {
    const clinic = await fetchClinicBySlug(params.clinicName);

    if (!clinic) {
      redirect("/");
    }

    const breadcrumbItems = [
      { text: "Fysfinder", link: "/" },
      {
        text: clinic.lokation,
        link: `/find/fysioterapeut/${clinic.lokationSlug}`,
      },
      { text: clinic.klinikNavn },
    ];

    const openingHours = [
      { day: "Mandag", hours: clinic.mandag },
      { day: "Tirsdag", hours: clinic.tirsdag },
      { day: "Onsdag", hours: clinic.onsdag },
      { day: "Torsdag", hours: clinic.torsdag },
      { day: "Fredag", hours: clinic.fredag },
      { day: "Lørdag", hours: clinic.lørdag },
      { day: "Søndag", hours: clinic.søndag },
    ];

    return (
      <div className="container mx-auto px-4 py-8">
        <ClinicStructuredData clinic={clinic} />
        <BreadcrumbStructuredData items={breadcrumbItems} />

        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main content (3/5 width on large screens) */}
          <div className="lg:w-3/5">
            <h1 className="text-3xl font-bold mb-2">{clinic.klinikNavn}</h1>
            <p className="text-gray-500 mb-2">
              {clinic.adresse}, {clinic.postnummer} {clinic.lokation}
            </p>
            <div className="flex items-center mb-10">
              <StarIcon className="h-6 w-6 text-amber-500 mr-2" />
              <span className="font-semibold mr-2">
                {clinic.avgRating != null ? clinic.avgRating.toFixed(1) : "N/A"}
              </span>
              <span className="text-gray-500">
                ({clinic.ratingCount} anmeldelser)
              </span>
            </div>

            {/* Jump link for mobile */}
            <Button
              variant="secondary"
              className="block lg:hidden mb-8"
              asChild
            >
              <a href="#contact-info">Se kontakt information</a>
            </Button>

            {/* Priser section */}
            <section className="py-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold mb-4">Priser</h2>
              {clinic.ydernummer && (
                <div className="flex items-center mb-2">
                  <span className="mr-2">Ydernummer</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              )}
              <p className="text-sm text-gray-600 mb-4">
                {clinic.ydernummer
                  ? `${clinic.klinikNavn} har ydernummer og tilbyder behandling med tilskud fra den offentlige sygesikring.`
                  : `${clinic.klinikNavn} har ikke ydernummer og kræver ingen henvisning.`}
              </p>
              {clinic.førsteKons && clinic.opfølgning ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Første konsult (60 min)</span>
                    <span className="font-semibold">
                      {clinic.førsteKons} kr
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Standard konsult (60 min)</span>
                    <span className="font-semibold">
                      {clinic.opfølgning} kr
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Ingen priser tilføjet.</p>
              )}
            </section>

            {clinic.team_members && clinic.team_members.length > 0 && (
              <MeetTheTeam
                teamMembers={clinic.team_members}
                clinicName={clinic.klinikNavn}
              />
            )}

            {/* Specialer section */}
            <section className="py-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold mb-2">Specialer</h2>
              {clinic.specialties && clinic.specialties.length > 0 ? (
                <>
                  <p className="mb-4">
                    {clinic.klinikNavn} er specialiseret i følgende
                    fysioterapeut discipliner
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {clinic.specialties.map((specialty) => (
                      <Link
                        key={specialty.specialty_id}
                        href={`/find/fysioterapeut/danmark/${specialty.specialty_name_slug}`}
                        className="transition-transform hover:scale-105"
                      >
                        <Badge
                          variant="secondary"
                          className="text-sm hover:bg-secondary/80 transition-colors cursor-pointer hover:shadow-sm"
                        >
                          {specialty.specialty_name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-600">Ingen specialer tilføjet.</p>
              )}
            </section>

            {/* Forsikring */}
            <section className="py-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold mb-4">Forsikring</h2>
              {clinic.insurances && clinic.insurances.length > 0 ? (
                <>
                  <p className="mb-4">
                    {clinic.klinikNavn} samarbejder med følgende
                    forsikringsselskaber:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {clinic.insurances.map((insurance) => (
                      <li
                        key={insurance.insurance_id}
                        className="flex items-center"
                      >
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>{insurance.insurance_name}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-gray-600">
                  Ingen forsikringssamarbejder tilføjet.
                </p>
              )}
            </section>

            {/* Ekstra ydelser section */}
            <section className="py-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold mb-2">Ekstra ydelser</h2>
              {clinic.extraServices && clinic.extraServices.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {clinic.extraServices.map((service) => (
                    <Badge
                      key={service.service_id}
                      variant="secondary"
                      className="text-sm"
                    >
                      {service.service_name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Ingen ekstra ydelser tilføjet.</p>
              )}
            </section>

            {/* Åbningstider og adgang section */}
            <section className="py-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold mb-4">
                Åbningstider og adgang
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  {hasAnyOpeningHours(clinic) ? (
                    <div className="space-y-2">
                      {openingHours.map(({ day, hours }) => (
                        <div key={day} className="flex justify-between">
                          <span>{day}</span>
                          <span className="font-semibold">{hours}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      Ingen åbningstider tilføjet.
                    </p>
                  )}
                </div>
                {hasAccessInfo(clinic) && (
                  <div>
                    <div className="space-y-2">
                      {clinic.parkering !== null && (
                        <div className="flex justify-between">
                          <span>Parkering</span>
                          <span className="font-semibold">
                            {clinic.parkering}
                          </span>
                        </div>
                      )}
                      {clinic.handicapadgang !== null && (
                        <div className="flex justify-between">
                          <span>Handicap adgang</span>
                          <span className="font-semibold">
                            {clinic.handicapadgang}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Google Maps location section */}
            <section className="py-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold mb-6">Lokation</h2>
              <GoogleMap address={`${clinic.adresse}, ${clinic.lokation}`} />
            </section>

            {/* Om clinicNavn section */}
            <section className="py-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold mb-2">
                Om {clinic.klinikNavn}
              </h2>
              {clinic.om_os ? (
                <p className="text-gray-600">{clinic.om_os}</p>
              ) : (
                <p className="text-gray-600">Ingen beskrivelse tilføjet.</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <ClinicSidebar clinic={clinic} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return (
      <div className="text-red-500 font-bold text-center py-10">
        Error loading clinic: {(error as Error).message}
      </div>
    );
  }
}
