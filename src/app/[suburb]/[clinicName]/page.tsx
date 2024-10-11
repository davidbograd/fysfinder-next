import React from "react";
import { createClient } from "@/app/utils/supabase/server";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { deslugify } from "../../utils/slugify";
import {
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";
import GoogleMap from "../../components/GoogleMap";
import { Metadata } from "next";

interface Clinic {
  uuid: string;
  klinikNavn: string;
  antalBehandlere: number;
  ydernummer: string;
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
}

async function fetchClinicBySlug(
  suburbSlug: string,
  clinicSlug: string
): Promise<Clinic | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("lokationSlug", suburbSlug)
    .eq("klinikNavnSlug", clinicSlug)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(
      `Failed to fetch clinic: ${error.message}. Slug was ${clinicSlug}`
    );
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

    return (
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl font-bold mb-2">{clinic.klinikNavn}</h1>
        <div className="flex items-center mb-6">
          <StarIcon className="h-6 w-6 text-amber-500 mr-1" />
          <span className="font-semibold mr-2">
            {clinic.avgRating != null ? clinic.avgRating.toFixed(1) : "N/A"}
          </span>
          <span className="text-gray-500">
            ({clinic.ratingCount} anmeldelser)
          </span>
        </div>

        <div className="mb-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <MapPinIcon className="h-6 w-6 text-gray-400 mr-2" />
              <p>
                {clinic.adresse}, {clinic.lokation}
              </p>
            </div>
            <div className="flex items-center">
              <GlobeAltIcon className="h-6 w-6 text-gray-400 mr-2" />
              <a
                href={clinic.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-logo-blue hover:underline"
              >
                {clinic.website}
              </a>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="h-6 w-6 text-gray-400 mr-2" />
              <span>{clinic.tlf}</span>
            </div>
            <div className="flex items-center">
              <EnvelopeIcon className="h-6 w-6 text-gray-400 mr-2" />
              <span>{clinic.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Priser</h2>
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
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Åbningstider</h2>
            <div className="space-y-2">
              {[
                "Mandag",
                "Tirsdag",
                "Onsdag",
                "Torsdag",
                "Fredag",
                "Lørdag",
                "Søndag",
              ].map((day) => (
                <div key={day} className="flex items-center justify-between">
                  <span>{day}</span>
                  <span className="font-semibold">
                    {clinic[day.toLowerCase() as keyof typeof clinic]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Andet</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Parkering</span>
                <span className="font-semibold">{clinic.parkering}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Handicap adgang</span>
                <span className="font-semibold">{clinic.handicapadgang}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Holdtræning</span>
                <span className="font-semibold">{clinic.holdtræning}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hjemmetræning</span>
                <span className="font-semibold">{clinic.hjemmetræning}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Lokation</h2>
          <GoogleMap address={`${clinic.adresse}, ${clinic.lokation}`} />
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
