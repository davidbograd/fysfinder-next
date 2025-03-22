import { Check } from "lucide-react";
import { Clinic } from "@/app/types";

interface ClinicPricingProps {
  clinic: Clinic;
}

export function ClinicPricing({ clinic }: ClinicPricingProps) {
  return (
    <section className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold mb-4">Priser</h2>
      {clinic.ydernummer === true && (
        <div className="flex items-center mb-2">
          <span className="mr-2">Ydernummer</span>
          <Check className="w-5 h-5 text-green-500" />
        </div>
      )}
      {clinic.ydernummer !== null && (
        <p className="text-sm text-gray-600 mb-4">
          {clinic.ydernummer
            ? `${clinic.klinikNavn} har ydernummer og tilbyder behandling med tilskud fra den offentlige sygesikring.`
            : `${clinic.klinikNavn} har ikke ydernummer og kræver ingen henvisning.`}
        </p>
      )}
      {clinic.ydernummer === true ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span>Første konsult (30 min)</span>
              <div className="text-right">
                <div className="font-semibold">514,47 kr</div>
                <div className="text-sm text-gray-500">
                  Med lægehenvisning: 312,28 kr
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span>Standard konsult (30 min)</span>
              <div className="text-right">
                <div className="font-semibold">327,12 kr</div>
                <div className="text-sm text-gray-500">
                  Med lægehenvisning: 198,56 kr
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : clinic.førsteKons && clinic.opfølgning ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Første konsult (60 min)</span>
            <span className="font-semibold">{clinic.førsteKons} kr</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Standard konsult (30 min)</span>
            <span className="font-semibold">{clinic.opfølgning} kr</span>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Ingen priser tilføjet.</p>
      )}
    </section>
  );
}
