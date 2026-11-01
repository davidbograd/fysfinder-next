// Location-page loading skeleton.
// Updated: 2026-11-01 - Skullet traces the page's own markup (breadcrumbs, headings, clinic cards) rendered from sample data.

import { Skeleton } from "skullet/react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import ClinicListingCard from "@/components/features/clinic/ClinicListingCard";

const SAMPLE_CLINICS = [1, 2, 3].map((i) => ({
  klinikNavn: "Fysioterapi og Træning Centrum",
  klinikNavnSlug: `eksempel-${i}`,
  ydernummer: true,
  avgRating: 4.8,
  ratingCount: 124,
  adresse: "Vestergade 12",
  postnummer: 8000,
  lokation: "Aarhus C",
  website: "www.fysioterapi-eksempel.dk",
  tlf: "12345678",
  specialties: [
    { specialty_id: `${i}-1`, specialty_name: "Sportsskader" },
    { specialty_id: `${i}-2`, specialty_name: "Ryg og nakke" },
    { specialty_id: `${i}-3`, specialty_name: "Genoptræning" },
  ],
}));

export default function Loading() {
  return (
    <Skeleton loading label="Indlæser fysioterapeuter">
      <div className="w-full">
        <div className="max-w-[800px] mx-auto">
          <Breadcrumbs
            items={[{ text: "Forside", link: "/" }, { text: "Aarhus" }]}
          />

          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Fysioterapeuter i Aarhus - Find den bedste fysioterapeut
          </h1>
          <h2 className="text-base md:text-lg text-gray-600 mb-4">
            Sammenlign klinikker, anmeldelser og specialer
          </h2>
          <p className="text-gray-600 mb-8">
            124 fysioterapi klinikker i Aarhus.
            <span className="hidden md:inline">
              {" "}
              Sammenlign anmeldelser, specialer og mere.
            </span>
          </p>

          <div
            skullet-block=""
            className="mb-4 h-14 w-full rounded-xl md:rounded-full"
          />
          <div className="flex gap-6 text-sm">
            <span>Har ydernummer</span>
            <span>Handicapadgang</span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-4">
            {SAMPLE_CLINICS.map((clinic) => (
              <ClinicListingCard key={clinic.klinikNavnSlug} {...clinic} />
            ))}
          </div>

          <div className="self-start xl:sticky xl:top-24">
            <div
              skullet-block=""
              className="h-[380px] w-full rounded-xl md:h-[520px]"
            />
          </div>
        </div>
      </div>
    </Skeleton>
  );
}
