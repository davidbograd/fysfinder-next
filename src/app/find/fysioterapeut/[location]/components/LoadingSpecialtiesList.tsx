"use client";

// Sample "Udforsk … med speciale i" row for the location loading skeleton; hidden on specialty pages, which don't show it.

import { useParams } from "next/navigation";
import { SpecialtiesList } from "@/components/features/specialty/SpecialtiesList";
import type { City, SpecialtyWithSeo } from "@/app/types";

const SAMPLE_CITY: City = {
  id: "sample",
  bynavn: "Aarhus",
  bynavn_slug: "aarhus",
  postal_codes: [],
  latitude: 0,
  longitude: 0,
  betegnelse: "",
};

const SAMPLE_SPECIALTIES: SpecialtyWithSeo[] = [
  "Sportsskader",
  "Ryg",
  "Skulder",
  "Knæ",
  "Nakke",
  "Genoptræning",
].map((name, i) => ({
  specialty_id: `sample-${i}`,
  specialty_name: name,
  specialty_name_slug: `sample-${i}`,
}));

const SAMPLE_COUNTS = Object.fromEntries(
  SAMPLE_SPECIALTIES.map((s, i) => [s.specialty_id, 6 - i])
);

export function LoadingSpecialtiesList() {
  const params = useParams<{ specialty?: string }>();
  if (params?.specialty) return null;

  return (
    <SpecialtiesList
      city={SAMPLE_CITY}
      specialties={SAMPLE_SPECIALTIES}
      specialtyMatchCounts={SAMPLE_COUNTS}
    />
  );
}
