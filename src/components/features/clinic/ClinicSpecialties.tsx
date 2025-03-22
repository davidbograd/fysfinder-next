import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Clinic } from "@/app/types";

interface ClinicSpecialtiesProps {
  clinic: Clinic;
}

export function ClinicSpecialties({ clinic }: ClinicSpecialtiesProps) {
  return (
    <section className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold mb-2">Specialer</h2>
      {clinic.specialties && clinic.specialties.length > 0 ? (
        <>
          <p className="mb-4">
            {clinic.klinikNavn} er specialiseret i følgende fysioterapeut
            discipliner
          </p>
          <div className="flex flex-wrap gap-2">
            {clinic.specialties.map((specialty) => (
              <Link
                key={specialty.specialty_id}
                href={`/find/fysioterapeut/danmark/${specialty.specialty_name_slug}`}
                className="transition-transform hover:scale-105"
              >
                <Badge
                  variant="secondary"
                  className="text-sm hover:bg-secondary/80 transition-colors cursor-pointer hover:shadow-sm"
                >
                  {specialty.specialty_name}
                </Badge>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-600">Ingen specialer tilføjet.</p>
      )}
    </section>
  );
}
