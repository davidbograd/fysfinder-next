"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { City, Clinic, SpecialtyWithSeo } from "@/app/types";

interface SpecialtiesListProps {
  city: City;
  clinics: Clinic[];
  specialties: SpecialtyWithSeo[];
}

export function SpecialtiesList({
  city,
  clinics,
  specialties,
}: SpecialtiesListProps) {
  const [showAll, setShowAll] = useState(false);

  // Count matches for each specialty
  const specialtyMatchCounts = specialties.reduce<Record<string, number>>(
    (acc, specialty) => {
      const matchCount = clinics.filter((clinic) =>
        clinic.specialties.some(
          (s) => s.specialty_name_slug === specialty.specialty_name_slug
        )
      ).length;
      acc[specialty.specialty_id.toString()] = matchCount;
      return acc;
    },
    {}
  );

  // Sort specialties by match count
  const sortedSpecialties = [...specialties]
    .filter(
      (specialty) => specialtyMatchCounts[specialty.specialty_id.toString()] > 0
    )
    .sort(
      (a, b) =>
        specialtyMatchCounts[b.specialty_id.toString()] -
        specialtyMatchCounts[a.specialty_id.toString()]
    );

  if (sortedSpecialties.length === 0) {
    return null;
  }

  const displayedSpecialties = showAll
    ? sortedSpecialties
    : sortedSpecialties.slice(0, 10);

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6">
        Fysioterapeuter med speciale i behandling af...
      </h2>
      <div className="flex flex-wrap gap-2">
        {displayedSpecialties.map((specialty) => (
          <Link
            key={specialty.specialty_id}
            href={`/find/fysioterapeut/${city.bynavn_slug}/${specialty.specialty_name_slug}`}
            className="transition-transform hover:scale-105"
          >
            <Badge
              variant="secondary"
              className="text-sm hover:bg-secondary/80 transition-colors cursor-pointer hover:shadow-sm"
            >
              <p>
                {specialty.specialty_name} {city.bynavn} (
                {specialtyMatchCounts[specialty.specialty_id]})
              </p>
            </Badge>
          </Link>
        ))}
      </div>
      {sortedSpecialties.length > 10 && !showAll && (
        <Button
          variant="outline"
          onClick={() => setShowAll(true)}
          className="w-full mt-4"
        >
          Vis alle {sortedSpecialties.length} specialer
        </Button>
      )}
    </div>
  );
}
