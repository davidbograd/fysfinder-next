// LocationClinicsMap
// Updated: move dynamic map loading into a client component wrapper

"use client";

import dynamic from "next/dynamic";
import { City, Clinic } from "@/app/types";

interface LocationClinicsMapProps {
  clinics: Clinic[];
  city: City;
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

export function LocationClinicsMap({ clinics, city }: LocationClinicsMapProps) {
  return <LocationClinicsMapClient clinics={clinics} city={city} />;
}

