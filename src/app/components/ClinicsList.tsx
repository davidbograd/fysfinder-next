"use client";

import { useState } from "react";
import Link from "next/link";
import { Clinic } from "@/app/types";
import ClinicCard from "./ClinicCard";
import { Button } from "@/components/ui/button";

interface ClinicsListProps {
  clinics: Clinic[];
  totalClinics: number;
  specialtySlug?: string;
  itemsPerPage?: number;
}

export function ClinicsList({
  clinics,
  totalClinics,
  specialtySlug,
  itemsPerPage = 100,
}: ClinicsListProps) {
  const [displayCount, setDisplayCount] = useState(itemsPerPage);

  const visibleClinics = clinics.slice(0, displayCount);
  const hasMore = displayCount < clinics.length;

  const loadMore = () => {
    setDisplayCount((prev) => Math.min(prev + itemsPerPage, clinics.length));
  };

  return (
    <div>
      <h3 className="text-sm text-gray-500 mb-4">
        {totalClinics} fysioterapi klinikker fundet
      </h3>

      <div className="space-y-4">
        {visibleClinics.map((clinic: Clinic) => {
          // If we're on a specialty page, reorder the specialties array to show the current specialty first
          let orderedSpecialties = clinic.specialties;
          if (specialtySlug && clinic.specialties) {
            orderedSpecialties = [
              ...clinic.specialties.filter(
                (s) => s.specialty_name_slug === specialtySlug
              ),
              ...clinic.specialties.filter(
                (s) => s.specialty_name_slug !== specialtySlug
              ),
            ];
          }

          return (
            <Link
              key={clinic.clinics_id}
              href={`/klinik/${clinic.klinikNavnSlug}`}
              className="block"
            >
              <ClinicCard
                klinikNavn={clinic.klinikNavn}
                ydernummer={clinic.ydernummer}
                avgRating={clinic.avgRating}
                ratingCount={clinic.ratingCount}
                adresse={clinic.adresse}
                postnummer={clinic.postnummer}
                lokation={clinic.lokation}
                specialties={orderedSpecialties}
                team_members={clinic.team_members}
              />
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <Button
            onClick={loadMore}
            variant="outline"
            className="min-w-[200px]"
          >
            Vis flere klinikker
          </Button>
        </div>
      )}
    </div>
  );
}
