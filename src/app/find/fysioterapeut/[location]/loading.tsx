// Location-page loading skeleton.
// Updated: 2026-11-01 - Skullet traces the page's own markup (breadcrumbs, headings, clinic cards) rendered from sample data.

import { Skeleton } from "skullet/react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import ClinicListingCard from "@/components/features/clinic/ClinicListingCard";
import { LoadingSpecialtiesList } from "@/app/find/fysioterapeut/[location]/components/LoadingSpecialtiesList";

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
            Find og sammenlign fysioterapeuter i Aarhus
          </h1>
          <p className="text-gray-600 mb-8">
            124 fysioterapi klinikker i Aarhus.
            <span className="hidden md:inline">
              {" "}
              Sammenlign anmeldelser, specialer og mere.
            </span>
          </p>

          {/* Mirrors SearchInterface with showFilters; the real one has data-fetching side effects on mount. */}
          <div className="mb-4">
            <div
              skullet-block=""
              className="h-[115px] md:h-[62px] rounded-xl md:rounded-full"
            />
            <div className="mx-3 flex flex-wrap gap-2 rounded-b-2xl border border-t-0 border-[#d8ddd9] bg-[#f2f1ec] p-2.5 md:mx-8">
              {["Med ydernummer", "Handicapadgang", "Online fysioterapi"].map(
                (label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8ddd9] bg-white py-1.5 pl-2 pr-3.5 text-sm"
                  >
                    <span className="h-5 w-5 rounded-full border" />
                    <span className="leading-none">{label}</span>
                  </span>
                )
              )}
            </div>
            <div
              skullet-block=""
              className="mt-4 h-[52px] rounded-full md:hidden"
            />
          </div>

          <LoadingSpecialtiesList />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-500 mb-4">
                124 fysioterapi klinikker fundet
              </h3>
              <div className="space-y-4">
                {SAMPLE_CLINICS.map((clinic) => (
                  <ClinicListingCard key={clinic.klinikNavnSlug} {...clinic} />
                ))}
              </div>
            </div>
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
