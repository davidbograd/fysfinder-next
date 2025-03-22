import { Badge } from "@/components/ui/badge";
import { Clinic } from "@/app/types";

interface ClinicServicesProps {
  clinic: Clinic;
}

export function ClinicServices({ clinic }: ClinicServicesProps) {
  return (
    <section className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold mb-2">Ekstra ydelser</h2>
      {clinic.extraServices && clinic.extraServices.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {clinic.extraServices.map((service) => (
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
