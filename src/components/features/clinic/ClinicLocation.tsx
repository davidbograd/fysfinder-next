import GoogleMap from "@/components/features/map/GoogleMap";
import { Clinic } from "@/app/types";

interface ClinicLocationProps {
  clinic: Clinic;
}

export function ClinicLocation({ clinic }: ClinicLocationProps) {
  return (
    <section className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold mb-6">Lokation</h2>
      <GoogleMap address={`${clinic.adresse}, ${clinic.lokation}`} />
    </section>
  );
}
