import { ClinicWithDistance } from "@/app/types";
import ClinicCard from "../../../../../components/features/clinic/ClinicCard";

interface NearbysClinicsListProps {
  clinics: ClinicWithDistance[];
  cityName: string;
  specialtySlug?: string;
  specialtyName?: string;
}

export function NearbyClinicsList({
  clinics,
  cityName,
  specialtySlug,
  specialtyName,
}: NearbysClinicsListProps) {
  if (clinics.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6">
        {specialtyName
          ? `Andre ${specialtyName.toLowerCase()} klinikker i nærheden af ${cityName}`
          : `Andre klinikker i nærheden af ${cityName}`}
      </h2>
      <div className="space-y-4">
        {clinics.map((clinic) => {
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
              distance={clinic.distance}
              specialties={orderedSpecialties}
              team_members={clinic.team_members}
              premium_listing={clinic.premium_listing}
              handicapadgang={clinic.handicapadgang}
              verified_klinik={clinic.verified_klinik}
            />
          );
        })}
      </div>
    </div>
  );
}
