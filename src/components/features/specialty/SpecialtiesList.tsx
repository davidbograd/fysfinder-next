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

  return (
    <div className="mt-6 mb-8 hidden md:block">
      <h2 className="text-lg font-semibold mb-2">
        Udforsk {city.bynavn} fysioterapeuter med speciale i...
      </h2>
      <div className="flex flex-wrap gap-2">
        {sortedSpecialties.map((specialty, index) => {
          // Mobile: hide items after index 1 (show 2), Desktop: hide items after index 4 (show 5)
          const shouldHideOnMobile = !showAll && index >= 2;
          const shouldHideOnDesktop = !showAll && index >= 5;

          return (
            <Link
              key={specialty.specialty_id}
              href={`/find/fysioterapeut/${city.bynavn_slug}/${specialty.specialty_name_slug}`}
              className={`transition-transform hover:scale-105 ${
                shouldHideOnMobile ? "hidden md:inline-block" : ""
              } ${shouldHideOnDesktop ? "md:hidden" : ""}`}
            >
              <Badge
                variant="secondary"
                className="text-sm hover:bg-secondary/80 transition-colors cursor-pointer hover:shadow-sm"
              >
                <p>
                  <span className="font-medium">
                    {specialty.specialty_name}
                  </span>{" "}
                  <span className="text-gray-500">
                    {specialtyMatchCounts[specialty.specialty_id]}
                  </span>
                </p>
              </Badge>
            </Link>
          );
        })}
        {/* Show button if more than 2 items (mobile shows 2, desktop shows 5) */}
        {sortedSpecialties.length > 2 && !showAll && (
          <Button
            variant="ghost"
            onClick={() => setShowAll(true)}
            className="text-sm text-gray-500 hover:text-gray-900 px-2 h-7"
          >
            <span className="md:hidden">
              + {sortedSpecialties.length - 2} flere specialer
            </span>
            <span className="hidden md:inline">
              + {sortedSpecialties.length - 5} flere specialer
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
