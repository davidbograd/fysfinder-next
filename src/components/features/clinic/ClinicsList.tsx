// ClinicsList component - Renders a paginated list of clinic cards
// Updated: 2026-10-08 - Reset the list when filters change the server-rendered first page.

"use client";

import { useState } from "react";
import { Clinic } from "@/app/types";
import ClinicListingCard from "./ClinicListingCard";
import { Button } from "@/components/ui/button";
import { orderSpecialties } from "@/lib/clinic-utils";
import { LOCATION_LIST_PAGE_SIZE } from "@/lib/location-listing";
import { loadMoreLocationClinics } from "@/app/actions/load-more-location-clinics";
import type { LocationFilters } from "@/app/find/fysioterapeut/filter-utils";

interface ClinicsListProps {
  initialClinics: Clinic[];
  totalClinics: number;
  locationSlug: string;
  specialtySlug?: string;
  filters?: LocationFilters;
  trackingContextCityId?: string;
}

export function ClinicsList({
  initialClinics,
  totalClinics,
  locationSlug,
  specialtySlug,
  filters,
  trackingContextCityId,
}: ClinicsListProps) {
  // Filter changes re-render the page with a new first page but keep this
  // instance mounted, so the list must reset whenever initialClinics changes.
  const [list, setList] = useState({
    source: initialClinics,
    clinics: initialClinics,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);

  if (list.source !== initialClinics) {
    setList({ source: initialClinics, clinics: initialClinics });
    setLoadError(false);
  }

  const clinics = list.clinics;
  const hasMore = clinics.length < totalClinics;

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    const requestSource = list.source;
    setIsLoadingMore(true);
    setLoadError(false);

    try {
      const nextClinics = await loadMoreLocationClinics({
        locationSlug,
        specialtySlug,
        filters,
        offset: clinics.length,
      });
      setList((current) =>
        current.source === requestSource
          ? { ...current, clinics: [...current.clinics, ...nextClinics] }
          : current
      );
    } catch (error) {
      console.error("Failed to load more clinics:", error);
      setLoadError(true);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div>
      <h3 className="text-sm text-gray-500 mb-4">
        {totalClinics >= 1000
          ? "Over 1000 fysioterapi klinikker fundet"
          : `${totalClinics} fysioterapi klinikker fundet`}
      </h3>

      <div className="space-y-4">
        {clinics.map((clinic: Clinic) => (
          <ClinicListingCard
            key={clinic.clinics_id}
            clinicId={clinic.clinics_id}
            klinikNavn={clinic.klinikNavn}
            klinikNavnSlug={clinic.klinikNavnSlug}
            ydernummer={clinic.ydernummer}
            avgRating={clinic.avgRating}
            ratingCount={clinic.ratingCount}
            adresse={clinic.adresse}
            postnummer={clinic.postnummer}
            lokation={clinic.lokation}
            website={clinic.website}
            logo_url={clinic.logo_url}
            tlf={clinic.tlf}
            specialties={orderSpecialties(clinic.specialties, specialtySlug)}
            team_members={clinic.team_members}
            premium_listing={clinic.premium_listing}
            handicapadgang={clinic.handicapadgang}
            verified_klinik={clinic.verified_klinik}
            trackingContextCityId={trackingContextCityId}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <Button
            onClick={loadMore}
            variant="outline"
            disabled={isLoadingMore}
            className="min-w-[200px] rounded-full"
          >
            {isLoadingMore ? "Indlæser..." : "Vis flere klinikker"}
          </Button>
          {loadError ? (
            <p className="mt-2 text-sm text-gray-500">
              Kunne ikke hente flere klinikker. Prøv igen.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
