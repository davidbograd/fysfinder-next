// NearbyClinicsList component - Renders nearby clinics with distance.
// Updated: forwards location tracking context so nearby interactions keep city attribution.

import { ClinicWithDistance } from "@/app/types";
import ClinicListingCard from "../../../../../components/features/clinic/ClinicListingCard";
import { orderSpecialties } from "@/lib/clinic-utils";

interface NearbyClinicsListProps {
  clinics: ClinicWithDistance[];
  cityName: string;
  trackingContextCityId?: string;
  specialtySlug?: string;
  specialtyName?: string;
}

export function NearbyClinicsList({
  clinics,
  cityName,
  trackingContextCityId,
  specialtySlug,
  specialtyName,
}: NearbyClinicsListProps) {
  if (clinics.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6">
        {specialtyName
          ? `Andre ${specialtyName.toLowerCase()} klinikker i nærheden af ${cityName}`
          : `Andre klinikker i nærheden af ${cityName}`}
      </h2>
      <div className="space-y-4">
        {clinics.map((clinic) => (
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
            distance={clinic.distance}
            specialties={orderSpecialties(clinic.specialties, specialtySlug)}
            team_members={clinic.team_members}
            premium_listing={clinic.premium_listing}
            handicapadgang={clinic.handicapadgang}
            verified_klinik={clinic.verified_klinik}
            trackingContextCityId={trackingContextCityId}
          />
        ))}
      </div>
    </div>
  );
}
