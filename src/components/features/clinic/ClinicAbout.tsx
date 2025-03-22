import { Clinic } from "@/app/types";

interface ClinicAboutProps {
  clinic: Clinic;
}

export function ClinicAbout({ clinic }: ClinicAboutProps) {
  return (
    <section className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold mb-2">Om {clinic.klinikNavn}</h2>
      {clinic.om_os ? (
        <p className="text-gray-600">{clinic.om_os}</p>
      ) : (
        <p className="text-gray-600">Ingen beskrivelse tilføjet.</p>
      )}
    </section>
  );
}
