// Dashboard clinic card actions.
// Updated: wires upgrade CTA to the real premium checkout flow.

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink, MapPin, Rocket } from "lucide-react";

interface ClinicCardProps {
  clinic: {
    clinics_id: string;
    klinikNavn: string;
    klinikNavnSlug: string;
    lokation: string | null;
    verified_klinik: boolean | null;
    hasActivePremium?: boolean;
    premiumCityNames?: string[];
  };
}

export const ClinicCard = ({ clinic }: ClinicCardProps) => {
  const router = useRouter();
  const isPremiumClinic = Boolean(clinic.hasActivePremium);
  const selectedPremiumCities = clinic.premiumCityNames || [];
  const homeCity = clinic.lokation?.trim() || "";
  const neighborCities = selectedPremiumCities.filter(
    (cityName) => cityName.trim().toLowerCase() !== homeCity.toLowerCase()
  );
  const visibleCities = [homeCity, ...neighborCities].filter(Boolean);
  const visibleCitiesLabel =
    homeCity && neighborCities.length > 0
      ? `${homeCity} + ${neighborCities.join(", ")} (fra premium)`
      : visibleCities.join(", ");

  const handleUpgrade = () => {
    router.push(`/dashboard/clinic/${clinic.clinics_id}/premium`);
  };

  return (
    <div className="border rounded-lg p-6 bg-white space-y-4">
      {/* Clinic Name and Location */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <h3 className="text-xl font-bold text-gray-900">{clinic.klinikNavn}</h3>
          {isPremiumClinic && (
            <Badge
              variant="secondary"
              className="border border-amber-200 bg-amber-50 text-amber-800"
            >
              Premium
            </Badge>
          )}
          <Link
            href={`/klinik/${clinic.klinikNavnSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline"
          >
            Se klinik
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
        {visibleCitiesLabel.length > 0 && (
          <p className="mt-1 flex items-center gap-1.5 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{visibleCitiesLabel}</span>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Button
          asChild
          variant="outline"
          className="w-fit justify-start"
        >
          <Link href={`/dashboard/clinic/${clinic.clinics_id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Rediger klinik
          </Link>
        </Button>

        {!isPremiumClinic && (
          <Button
            onClick={handleUpgrade}
            variant="default"
            className="w-fit justify-start bg-brand-primary text-brand-cream hover:bg-brand-primary/90"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Opgrader til premium
          </Button>
        )}
      </div>
    </div>
  );
};

