import { Clinic } from "@/app/types";

interface ClinicHoursProps {
  clinic: Clinic;
}

function hasAnyOpeningHours(clinic: Clinic): boolean {
  return [
    clinic.mandag,
    clinic.tirsdag,
    clinic.onsdag,
    clinic.torsdag,
    clinic.fredag,
    clinic.lørdag,
    clinic.søndag,
  ].some((day) => day !== null);
}

function hasAccessInfo(clinic: Clinic): boolean {
  return clinic.parkering !== null || clinic.handicapadgang !== null;
}

export function ClinicHours({ clinic }: ClinicHoursProps) {
  const openingHours = [
    { day: "Mandag", hours: clinic.mandag },
    { day: "Tirsdag", hours: clinic.tirsdag },
    { day: "Onsdag", hours: clinic.onsdag },
    { day: "Torsdag", hours: clinic.torsdag },
    { day: "Fredag", hours: clinic.fredag },
    { day: "Lørdag", hours: clinic.lørdag },
    { day: "Søndag", hours: clinic.søndag },
  ];

  return (
    <section className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold mb-4">Åbningstider og adgang</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {hasAnyOpeningHours(clinic) ? (
            <div className="space-y-2">
              {openingHours.map(({ day, hours }) => (
                <div key={day} className="flex justify-between">
                  <span>{day}</span>
                  <span className="font-semibold">{hours}</span>
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
              {clinic.handicapadgang !== null && (
                <div className="flex justify-between">
                  <span>Handicap adgang</span>
                  <span className="font-semibold">{clinic.handicapadgang}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
