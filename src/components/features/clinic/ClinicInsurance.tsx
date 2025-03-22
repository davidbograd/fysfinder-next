import { Check } from "lucide-react";
import { Clinic } from "@/app/types";

interface ClinicInsuranceProps {
  clinic: Clinic;
}

export function ClinicInsurance({ clinic }: ClinicInsuranceProps) {
  return (
    <section className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold mb-4">Forsikring</h2>
      {clinic.insurances && clinic.insurances.length > 0 ? (
        <>
          <p className="mb-4">
            {clinic.klinikNavn} samarbejder med følgende forsikringsselskaber:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {clinic.insurances.map((insurance) => (
              <li key={insurance.insurance_id} className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>{insurance.insurance_name}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-gray-600">Ingen forsikringssamarbejder tilføjet.</p>
      )}
    </section>
  );
}
