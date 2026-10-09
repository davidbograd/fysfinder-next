import Link from "next/link";

interface NoResultsFoundProps {
  cityName: string;
  cityPreposition?: "i" | "på";
  specialtyName?: string | null;
  locationSlug: string;
}

export function NoResultsFound({
  cityName,
  cityPreposition = "i",
  specialtyName,
  locationSlug,
}: NoResultsFoundProps) {
  const cityPhrase = `${cityPreposition} ${cityName}`;

  return (
    <div className="text-center py-16">
      <h2 className="text-xl font-semibold mb-4">
        {specialtyName
          ? `Ingen fysioterapeuter med speciale i ${specialtyName.toLowerCase()} ${cityPhrase}`
          : `Ingen klinikker fundet ${cityPhrase}`}
      </h2>
      <p className="text-gray-600 mb-8">
        {specialtyName
          ? `Vi har desværre ikke registreret nogle fysioterapeuter med dette speciale ${cityPhrase}. Prøv at vælge et andet speciale eller se alle fysioterapeuter i området.`
          : `Vi har desværre ikke registreret nogle fysioterapeuter i dette område endnu.`}
      </p>
      {specialtyName && (
        <Link
          href={`/find/fysioterapeut/${locationSlug}`}
          className="text-logo-blue hover:underline"
        >
          Se alle fysioterapeuter {cityPhrase} →
        </Link>
      )}
    </div>
  );
}
