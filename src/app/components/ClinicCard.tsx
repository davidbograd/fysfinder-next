import { StarIcon } from "@heroicons/react/24/solid";
import { MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  klinikNavn: string;
  ydernummer: boolean;
  avgRating: number;
  ratingCount: number;
  adresse: string;
  postnummer: number;
  lokation: string;
  distance?: number;
  specialties?: {
    specialty_name: string;
    specialty_id: string;
  }[];
}

const ClinicCard: React.FC<Props> = ({
  klinikNavn,
  ydernummer,
  avgRating,
  ratingCount,
  adresse,
  postnummer,
  lokation,
  distance,
  specialties = [],
}) => {
  return (
    <div className="p-6 rounded-lg border hover:shadow-md transition-shadow duration-200 bg-white w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div className="flex-grow">
          <h3 className="text-xl font-semibold mb-2 text-gray-900">
            {klinikNavn}
          </h3>
          <div className="flex items-center mb-3">
            <StarIcon className="size-5 mr-2 flex-shrink-0 text-amber-500" />
            <div className="flex items-center">
              <span className="text-gray-700 mr-2 font-semibold">
                {avgRating && avgRating > 0 ? avgRating.toFixed(1) : "-"}
              </span>
              <span className="text-gray-500">({ratingCount} anmeldelser)</span>
            </div>
          </div>
          <div
            className={`flex items-center text-gray-500 ${
              ydernummer || specialties.length > 0 ? "mb-3" : ""
            }`}
          >
            <MapPin className="size-5 mr-2 flex-shrink-0 stroke-2" />
            <div className="flex items-center">
              {adresse}, {postnummer} {lokation}
              {distance !== undefined && (
                <>
                  <span className="mx-2">•</span>
                  {distance.toFixed(1)} km væk
                </>
              )}
            </div>
          </div>
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {specialties.slice(0, 5).map((specialty) => (
                <Badge
                  key={specialty.specialty_id}
                  variant="outline"
                  className="text-sm"
                >
                  {specialty.specialty_name}
                </Badge>
              ))}
              {specialties.length > 5 && (
                <Badge variant="outline" className="text-sm">
                  +{specialties.length - 5}
                </Badge>
              )}
            </div>
          )}
          {ydernummer && (
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-1 w-auto"
            >
              <Check className="size-3 stroke-2 text-logo-blue" />
              Har ydernummer
            </Badge>
          )}
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 sm:text-right">
          <span className="text-logo-blue hover:text-blue-700 font-medium">
            Se klinik →
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClinicCard;
