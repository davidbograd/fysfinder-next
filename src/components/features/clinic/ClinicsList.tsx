// ClinicsList component - Renders a paginated list of clinic cards
// Updated to use shared orderSpecialties utility

"use client";

import { useState } from "react";
import { Clinic } from "@/app/types";
import ClinicCard from "./ClinicCard";
import { Button } from "@/components/ui/button";
import { orderSpecialties } from "@/lib/clinic-utils";

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
        {totalClinics >= 1000
          ? "Over 1000 fysioterapi klinikker fundet"
          : `${totalClinics} fysioterapi klinikker fundet`}
      </h3>

      <div className="space-y-4">
        {visibleClinics.map((clinic: Clinic) => (
          <ClinicCard
            key={clinic.clinics_id}
            klinikNavn={clinic.klinikNavn}
            klinikNavnSlug={clinic.klinikNavnSlug}
            ydernummer={clinic.ydernummer}
            avgRating={clinic.avgRating}
            ratingCount={clinic.ratingCount}
            adresse={clinic.adresse}
            postnummer={clinic.postnummer}
            lokation={clinic.lokation}
            website={clinic.website}
            tlf={clinic.tlf}
            specialties={orderSpecialties(clinic.specialties, specialtySlug)}
            team_members={clinic.team_members}
            premium_listing={clinic.premium_listing}
            handicapadgang={clinic.handicapadgang}
            verified_klinik={clinic.verified_klinik}
          />
        ))}
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
