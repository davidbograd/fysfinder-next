import { Clinic } from "@/app/types";
import { FaWheelchair } from "react-icons/fa";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatOpeningHoursDa,
  hasAnyKnownOpeningHours,
  resolveClinicOpeningHours,
} from "@/lib/opening-hours";

interface ClinicHoursProps {
  clinic: Clinic;
}

function hasAccessInfo(clinic: Clinic): boolean {
  return clinic.parkering !== null || clinic.handicapadgang !== undefined;
}

function renderHandicapAccess(handicapadgang: boolean | null | undefined) {
  if (handicapadgang === null || handicapadgang === undefined) {
    return "?";
  }

  if (handicapadgang === false) {
    return "Nej";
  }

  if (handicapadgang === true) {
    return (
      <span className="flex items-center gap-1">
        Ja
        <FaWheelchair
          className="w-4 h-4 text-logo-blue"
          aria-label="Wheelchair accessible"
        />
      </span>
    );
  }
}

export function ClinicHours({ clinic }: ClinicHoursProps) {
  const openingHours = resolveClinicOpeningHours(clinic);
  const rows = formatOpeningHoursDa(openingHours);

  return (
    <section className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold mb-4">Åbningstider og adgang</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {hasAnyKnownOpeningHours(openingHours) ? (
            <div className="space-y-2">
              {rows.map(({ day, label, hours }) => (
                <div key={day} className="flex justify-between">
                  <span>{label}</span>
                  <span className="font-semibold">
                    {hours ?? <span className="text-gray-500">–</span>}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Ingen åbningstider tilføjet.</p>
          )}
        </div>
        {hasAccessInfo(clinic) && (
          <div>
            <div className="space-y-2">
              {clinic.parkering !== null && (
                <div className="flex justify-between">
                  <span>Parkering</span>
                  <span className="font-semibold">{clinic.parkering}</span>
                </div>
              )}
              {clinic.handicapadgang !== undefined && (
                <div className="flex justify-between">
                  <span>Handicap adgang</span>
                  <span className="font-semibold">
                    {renderHandicapAccess(clinic.handicapadgang)}
                  </span>
                </div>
              )}
              {clinic.god_adgang_verificeret && (
                <TooltipProvider delayDuration={50}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between cursor-help">
                        <span className="inline-flex items-center gap-1">
                          God Adgang
                          <Image
                            src="/images/klinik/god-adgang-badge.png"
                            alt="God Adgang badge"
                            width={16}
                            height={16}
                            className="w-4 h-4"
                          />
                        </span>
                        <span className="font-semibold">Ja, registeret</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="font-normal">
                      <p>
                        Klinikens forhold er registret af organisation God
                        Adgang
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
