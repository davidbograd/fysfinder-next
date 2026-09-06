// LocationClinicsMap
// Updated: 2026-09-06 - Accept slim map-marker clinic payloads.

"use client";

import dynamic from "next/dynamic";
import { City } from "@/app/types";
import { LocationMapClinic } from "@/lib/location-listing";

interface LocationClinicsMapProps {
  clinics: LocationMapClinic[];
  city: City;
  resultsScopeLabel?: string;
}

const LocationClinicsMapClient = dynamic(
  () =>
    import("./LocationClinicsMapClient").then(
      (module) => module.LocationClinicsMapClient
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] rounded-xl border border-gray-200 bg-gray-50 p-4 md:h-[520px]">
        <p className="text-sm text-gray-600">Indlaeser kort...</p>
      </div>
    ),
  }
);

export function LocationClinicsMap({
  clinics,
  city,
  resultsScopeLabel,
}: LocationClinicsMapProps) {
  return (
    <LocationClinicsMapClient
      clinics={clinics}
      city={city}
      resultsScopeLabel={resultsScopeLabel}
    />
  );
}

