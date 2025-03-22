import { Button } from "@/components/ui/button";
import { Clinic } from "@/app/types";

interface ClinicClaimProps {
  clinic: Clinic;
}

export function ClinicClaim({ clinic }: ClinicClaimProps) {
  if (clinic.verified_klinik) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="flex flex-col gap-2">
        <p>
          <strong>Ejer du {clinic.klinikNavn}?</strong>
        </p>
        <p className="text-gray-600">
          Opdater dine oplysninger, og tiltræk flere patienter med korrekt
          information.
        </p>
        <Button variant="outline" className="self-start" asChild>
          <a
            href="https://tally.so/r/wdk75r"
            target="_blank"
            rel="noopener noreferrer"
          >
            Verificer klinik
          </a>
        </Button>
      </div>
    </section>
  );
}
