import React from "react";
import { MeetTheTeam } from "@/app/components/MeetTheTeam";
import { createClient } from "@/app/utils/supabase/server";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { StarIcon, CheckIcon } from "@heroicons/react/24/solid";
import GoogleMap from "../../components/GoogleMap";
import { Metadata } from "next";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Phone, Globe, Mail, X } from "lucide-react";
import { ClinicSidebar } from "@/app/components/ClinicSidebar";

interface Specialty {
  specialty_id: string;
  specialty_name: string;
}

interface Clinic {
  clinics_id: string; // Changed from uuid: string
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

// Move the helper function outside of the component
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

async function fetchClinicBySlug(
  suburbSlug: string,
  clinicSlug: string
): Promise<Clinic | null> {
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
    .eq("lokationSlug", suburbSlug)
    .eq("klinikNavnSlug", clinicSlug)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      `Failed to fetch clinic: ${error.message}. Slug was ${clinicSlug}`
    );
  }

  if (data) {
    // Flatten the specialties array
    data.specialties = data.specialties.map((item: any) => item.specialty);
  }

  return data;
}

function generateSeoTitle(clinicName: string): string {
  const suffix = " | Se detaljer";
  const maxLength = 60;
  const maxClinicNameLength = maxLength - suffix.length;

  if (clinicName.length <= maxClinicNameLength) {
    return clinicName + suffix;
  }

  return clinicName.slice(0, maxClinicNameLength - 1).trim() + "..." + suffix;
}

export async function generateMetadata({
  params,
}: {
  params: { suburb: string; clinicName: string };
}): Promise<Metadata> {
  const clinic = await fetchClinicBySlug(params.suburb, params.clinicName);

  if (!clinic) {
    throw new Error("Clinic not found");
  }

  return {
    title: `${clinic.klinikNavn} | Se detaljer`,
    description: `Se åbningstider, priser og behandlingstyper for ${clinic.klinikNavn}, ${clinic.lokation}.`,
  };
}

interface ClinicStructuredDataProps {
  clinic: Clinic;
}

function ClinicStructuredData({ clinic }: ClinicStructuredDataProps) {
  // Helper function to format opening hours
  function formatOpeningHours(timeString: string | null) {
    if (!timeString) return null;
    const [opens, closes] = timeString.split("-").map((time) => time.trim());
    return { opens, closes };
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `https://fysfinder.dk/${clinic.lokationSlug}/${clinic.klinikNavnSlug}`,
    name: clinic.klinikNavn,
    description: clinic.om_os || `Fysioterapi klinik i ${clinic.lokation}`,

    // Location and contact info
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic.adresse,
      addressLocality: clinic.lokation,
      postalCode: clinic.postnummer,
      addressCountry: "DK",
    },
    telephone: clinic.tlf,
    email: clinic.email,
    url: clinic.website,

    // Ratings
    aggregateRating: clinic.avgRating
      ? {
          "@type": "AggregateRating",
          ratingValue: clinic.avgRating,
          reviewCount: clinic.ratingCount,
          bestRating: "5",
          worstRating: "1",
        }
      : undefined,

    // Opening hours
    openingHoursSpecification: [
      clinic.mandag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Monday",
        ...formatOpeningHours(clinic.mandag),
      },
      clinic.tirsdag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Tuesday",
        ...formatOpeningHours(clinic.tirsdag),
      },
      clinic.onsdag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Wednesday",
        ...formatOpeningHours(clinic.onsdag),
      },
      clinic.torsdag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Thursday",
        ...formatOpeningHours(clinic.torsdag),
      },
      clinic.fredag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        ...formatOpeningHours(clinic.fredag),
      },
      clinic.lørdag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        ...formatOpeningHours(clinic.lørdag),
      },
      clinic.søndag && {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        ...formatOpeningHours(clinic.søndag),
      },
    ].filter(Boolean),

    currenciesAccepted: "DKK",

    // Medical specialties and services
    medicalSpecialty: clinic.specialties?.map((s) => s.specialty_name),
    availableService: [
      ...(clinic.specialties?.map((s) => ({
        "@type": "MedicalTherapy",
        name: s.specialty_name,
      })) || []),
      clinic.holdtræning && {
        "@type": "MedicalTherapy",
        name: "Holdtræning",
      },
      clinic.hjemmetræning && {
        "@type": "MedicalTherapy",
        name: "Hjemmetræning",
      },
    ].filter(Boolean),

    // Accessibility features
    amenityFeature: [
      clinic.handicapadgang && {
        "@type": "LocationFeatureSpecification",
        name: "Handicap adgang",
        value: true,
      },
      clinic.parkering && {
        "@type": "LocationFeatureSpecification",
        name: "Parkering",
        value: true,
      },
    ].filter(Boolean),

    // Pricing catalog
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Behandlinger",
      itemListElement: [
        {
          "@type": "Offer",
          name: "Første konsultation",
          price: clinic.førsteKons,
          priceCurrency: "DKK",
        },
        {
          "@type": "Offer",
          name: "Opfølgende konsultation",
          price: clinic.opfølgning,
          priceCurrency: "DKK",
        },
      ],
    },
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
  params: { suburb: string; clinicName: string };
}) {
  try {
    const clinic = await fetchClinicBySlug(params.suburb, params.clinicName);

    if (!clinic) {
      return <div className="text-center mt-10">Clinic not found</div>;
    }

    const breadcrumbItems = [
      { text: "Forside", link: "/" },
      { text: clinic.lokation, link: `/${clinic.lokationSlug}` },
      { text: clinic.klinikNavn },
    ];

    // Remove the hardcoded specialer array
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

    const dayMapping: { [key: string]: keyof Clinic } = {
      Mandag: "mandag",
      Tirsdag: "tirsdag",
      Onsdag: "onsdag",
      Torsdag: "torsdag",
      Fredag: "fredag",
      Lørdag: "lørdag",
      Søndag: "søndag",
    };

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
        {clinic && <ClinicStructuredData clinic={clinic} />}
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
                <p className="text-gray-600">
                  Denne klinik har ikke tilføjet nogen priser endnu.
                </p>
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
                <p className="text-gray-600">
                  Denne klinik har ikke tilføjet nogen specialer endnu.
                </p>
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
                      Åbningstider ikke tilføjet endnu.
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

            {/* Update the "Om clinicNavn" section */}
            <section className="py-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold mb-2">
                Om {clinic.klinikNavn}
              </h2>
              {clinic.om_os ? (
                <p className="text-gray-600">{clinic.om_os}</p>
              ) : (
                <p className="text-gray-600">
                  Vi har desværre ikke en beskrivelse af {clinic.klinikNavn}{" "}
                  endnu.
                </p>
              )}
            </section>
          </div>

          {/* Replace the old sidebar with the new component */}
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
