import { StarIcon } from "@heroicons/react/24/solid";
import { MapPin, Check } from "lucide-react";

interface Props {
  klinikNavn: string;
  ydernummer: boolean;
  avgRating: number;
  ratingCount: number;
  adresse: string;
  postnummer: number;
  lokation: string;
}

const ClinicCard: React.FC<Props> = ({
  klinikNavn,
  ydernummer,
  avgRating,
  ratingCount,
  adresse,
  postnummer,
  lokation,
}) => {
  return (
    <div className="p-4 rounded-md border hover:shadow-lg transition-shadow duration-200">
      <h2 className="text-logo-blue text-lg font-semibold mb-2">
        {klinikNavn}
      </h2>
      <div className="flex items-center mb-2">
        <StarIcon className="size-5 text-amber-500 mr-1" />
        <span className="text-gray-700 mr-2 flex items-center">
          {avgRating !== null ? avgRating.toFixed(1) : "-"}
        </span>
        <span className="text-gray-500 flex items-center">
          ({ratingCount} anmeldelser)
        </span>
      </div>
      <div className="flex items-center text-gray-500 text-sm mb-2">
        <MapPin className="size-5 mr-1 flex-shrink-0 stroke-2" />
        <span>
          {adresse}, {postnummer} {lokation}
        </span>
      </div>
      {ydernummer && (
        <div className="flex items-center mt-2 text-gray-500">
          <Check className="size-5 text-green-600 mr-1 stroke-2" />
          <span className="text-sm">Har ydernummer</span>
        </div>
      )}
    </div>
  );
};

export default ClinicCard;
