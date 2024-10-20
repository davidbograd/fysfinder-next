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
import { EmailButton } from "@/components/EmailButton";
import { PhoneButton } from "@/components/PhoneButton";

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

export async function generateMetadata({
  params,
}: {
  params: { suburb: string; clinicName: string };
}): Promise<Metadata> {
  const clinic = await fetchClinicBySlug(params.suburb, params.clinicName);

  if (!clinic) {
    return {
      title: "Klinik ikke fundet - Fysfinder",
      description: "Beklager, vi kunne ikke finde den ønskede klinik.",
    };
  }

  return {
    title: `${clinic.klinikNavn} | Fysioterapeut ${clinic.lokation} - Se alle detaljer`,
    description: `Se åbningstider, priser og behandlingstyper for ${clinic.klinikNavn}, ${clinic.lokation}.`,
  };
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Første konsult (60 min)</span>
                  <span className="font-semibold">{clinic.førsteKons} kr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Standard konsult (60 min)</span>
                  <span className="font-semibold">{clinic.opfølgning} kr</span>
                </div>
              </div>
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
                  Denne klinik har ikke tilføjet nogen specialer endnu.!!
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
                  <div className="space-y-2">
                    {openingHours.map(({ day, hours }) => (
                      <div key={day} className="flex justify-between">
                        <span>{day}</span>
                        <span className="font-semibold">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Parkering</span>
                      <span className="font-semibold">{clinic.parkering}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Handicap adgang</span>
                      <span className="font-semibold">
                        {clinic.handicapadgang}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Google Maps location section */}
            <section className="py-8 border-b border-gray-200">
              <h2 className="text-2xl font-semibold mb-6">Lokation</h2>
              <GoogleMap address={`${clinic.adresse}, ${clinic.lokation}`} />
            </section>

            {clinic.northstar && (
              <section className="py-8 border-b border-gray-200">
                <h2 className="text-2xl font-semibold mb-2">
                  Om {clinic.klinikNavn}
                </h2>
                <p className="text-gray-600">
                  Som patient hos os, kan du forvente et professionelt
                  behandlingsforløb, med behandling som er videnskabeligt og
                  klinisk dokumenteret. Du bydes ind til nye og moderne
                  omgivelser med en rolig og behagelig stemning, hvor du bliver
                  sat i centrum.
                </p>
              </section>
            )}
          </div>

          {/* Sticky sidebar (2/5 width on large screens) */}
          <div className="lg:w-2/5">
            <div
              id="contact-info"
              className="sticky top-4 bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center mb-4">
                {/* Circular logo placeholder */}
                {/* You can replace this with an actual image later */}
                {clinic.northstar && (
                  <Image
                    src="/fysiopuls-logo.jpg"
                    alt="Clinic logo"
                    width={64}
                    height={64}
                    className="rounded-lg flex-shrink-0 mr-4"
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold">{clinic.klinikNavn}</h2>
                  <div className="flex items-center mt-1">
                    <StarIcon className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="font-semibold mr-2">
                      {clinic.avgRating != null
                        ? clinic.avgRating.toFixed(1)
                        : "N/A"}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({clinic.ratingCount} anmeldelser)
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 mt-6">
                {clinic.northstar && (
                  <Button className="w-full mb-4" variant="default" asChild>
                    <a
                      href="https://application.complimentawork.dk/CamClientPortal/CamClientPortal.html?clinic=00000A00CA04000007D404000000016B027EE85F66BAA6BB"
                      target="_blank"
                      rel="noopener"
                    >
                      Book tid
                    </a>
                  </Button>
                )}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-start"
                    asChild
                  >
                    <a href={clinic.website} target="_blank" rel="noopener">
                      <Globe className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{clinic.website}</span>
                    </a>
                  </Button>
                  <PhoneButton phoneNumber={clinic.tlf} />
                  <EmailButton email={clinic.email} />
                </div>
              </div>
            </div>
          </div>
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
