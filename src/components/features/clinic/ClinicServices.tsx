import { Badge } from "@/components/ui/badge";
import { Clinic } from "@/app/types";
import Link from "next/link";

interface ClinicServicesProps {
  clinic: Clinic;
}

export function ClinicServices({ clinic }: ClinicServicesProps) {
  const extraServices = clinic.extraServices ?? [];
  const isOnline = clinic.online_fysioterapeut === true;

  return (
    <section className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold mb-2">Ekstra ydelser</h2>
      {isOnline || extraServices.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {isOnline && (
            <Link
              href="/find/fysioterapeut/online"
              className="transition-transform hover:scale-105"
            >
              <Badge
                variant="secondary"
                className="text-sm hover:bg-secondary/80 transition-colors cursor-pointer hover:shadow-sm"
              >
                Online fysioterapi
              </Badge>
            </Link>
          )}
          {extraServices.map((service) => (
            <Badge
              key={service.service_id}
              variant="secondary"
              className="text-sm"
            >
              {service.service_name}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Ingen ekstra ydelser tilføjet.</p>
      )}
    </section>
  );
}
