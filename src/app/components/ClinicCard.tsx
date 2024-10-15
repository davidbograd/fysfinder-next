import { StarIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/solid";

interface Props {
  klinikNavn: string;
  antalBehandlere: number;
  ydernummer: boolean;
  avgRating: number;
  ratingCount: number;
}

const ClinicCard: React.FC<Props> = ({
  klinikNavn,
  antalBehandlere,
  ydernummer,
  avgRating,
  ratingCount,
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
      <div className="flex justify-between items-center mt-2">
        <p
          className={`text-slate-700 ${
            antalBehandlere === null ? "text-gray-300" : ""
          }`}
        >
          {antalBehandlere === null ? "?" : antalBehandlere} behandlere
        </p>
        {ydernummer && (
          <div className="flex items-center">
            <span className="mr-1 text-sm">Ydernummer</span>
            <CheckIcon className="size-5 text-green-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicCard;
