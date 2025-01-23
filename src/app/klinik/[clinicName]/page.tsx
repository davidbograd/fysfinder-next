import React from "react";
import { MeetTheTeam } from "@/app/components/MeetTheTeam";
import { createClient } from "@/app/utils/supabase/server";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { StarIcon } from "@heroicons/react/24/solid";
import GoogleMap from "../../components/GoogleMap";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Phone, Globe, Mail } from "lucide-react";
import { ClinicSidebar } from "@/app/components/ClinicSidebar";
import { redirect } from "next/navigation";

interface Specialty {
  specialty_id: string;
  specialty_name: string;
}

interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  antalBehandlere: number;
  ydernummer: boolean;
  avgRating: number;
  ratingCount: number;
  lokation: string;
  lokationSlug: string;
  adresse: string;
  website: string;
  tlf: string;
  email: string;
  førsteKons: number;
  opfølgning: number;
  mandag: string;
  tirsdag: string;
  onsdag: string;
  torsdag: string;
  fredag: string;
  lørdag: string;
  søndag: string;
  parkering: string;
  handicapadgang: string;
  holdtræning: string;
  hjemmetræning: string;
  klinikNavnSlug: string;
  postnummer: number;
  northstar: boolean;
  specialties: Specialty[];
  om_os: string | null;
}

async function fetchClinicBySlug(clinicSlug: string): Promise<Clinic | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clinics")
    .select(
      `
      *,
      specialties:clinic_specialties(
        specialty:specialties(specialty_id, specialty_name)
      )
    `
    )
    .eq("klinikNavnSlug", clinicSlug)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // Flatten the specialties array
  data.specialties = data.specialties.map((item: any) => item.specialty);

  return data;
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

    const ekstraYdelser = [
      "Akupunktur",
      "Ultralyd",
      "Shockwave",
      "Indlægssåler",
      "Personlig træning",
      "Online coaching",
    ];

    const insuranceCompanies = [
      "PFA",
      "Skandia",
      "Mølhom",
      "Dansk Sundhedssikring",
      "Top Danmark",
      "PrivatSikring",
      "Tryg",
      "PensionDanmark",
      "Danica",
      "Falck Healthcare",
      "Nordic Netcare",
      "Codan",
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

            {clinic.northstar && <MeetTheTeam />}

            {/* Specialer section */}
            <section className="py-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold mb-2">Specialer</h2>
              {clinic.specialties && clinic.specialties.length > 0 ? (
                <>
                  <p className="mb-4">
                    {clinic.klinikNavn} er ekstra gode til følgende
                    fysioterapeut discipliner
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {clinic.specialties.map((specialty) => (
                      <Badge
                        key={specialty.specialty_id}
                        variant="secondary"
                        className="text-sm"
                      >
                        {specialty.specialty_name}
                      </Badge>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-600">Ingen specialer tilføjet.</p>
              )}
            </section>

            {clinic.northstar && (
              <>
                {/* Forsikring */}
                <section className="py-8 border-b border-gray-200">
                  <h2 className="text-2xl font-semibold mb-4">Forsikring</h2>
                  <p className="mb-4">
                    {clinic.klinikNavn} samarbejder med følgende
                    forsikringsselskaber:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {insuranceCompanies.map((company) => (
                      <li key={company} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        <span>{company}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Ekstra ydelser section */}
                <section className="py-8 border-b border-gray-200">
                  <h2 className="text-2xl font-semibold mb-2">
                    Ekstra ydelser
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {ekstraYdelser.map((ydelse) => (
                      <Badge
                        key={ydelse}
                        variant="secondary"
                        className="text-sm"
                      >
                        {ydelse}
                      </Badge>
                    ))}
                  </div>
                </section>
              </>
            )}

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
