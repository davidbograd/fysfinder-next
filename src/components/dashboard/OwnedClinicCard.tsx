// Dashboard owned-clinic card: edit / premium actions + profile completeness.
// Updated: wires upgrade CTA to the real premium checkout flow.

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ClinicProfileCompleteness } from "@/lib/clinic-profile-completeness";
import {
  CLINIC_PROFILE_CONTACT_ADD_INFO_CTA_DA,
  CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA,
  clinicProfileChecklistDetailLabelsDa,
  getClinicProfileCompletenessAriaDa,
  getClinicProfileCompletenessNudgeDa,
} from "@/lib/clinic-profile-completeness";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Edit,
  ExternalLink,
  Info,
  MapPin,
  Rocket,
} from "lucide-react";

/** Filled segment color by number of completed checklist steps (7 = full, no bar). */
const clinicProfileProgressFilledClass = (completedCount: number): string => {
  if (completedCount >= 1 && completedCount <= 3) {
    return "bg-orange-500";
  }
  if (completedCount >= 4 && completedCount <= 5) {
    return "bg-yellow-500";
  }
  if (completedCount === 6) {
    return "bg-green-600";
  }
  return "bg-green-600";
};

interface OwnedClinicCardProps {
  clinic: {
    clinics_id: string;
    klinikNavn: string;
    klinikNavnSlug: string;
    lokation: string | null;
    verified_klinik: boolean | null;
    hasActivePremium?: boolean;
    premiumCityNames?: string[];
    profileCompleteness: ClinicProfileCompleteness;
  };
}

export const OwnedClinicCard = ({ clinic }: OwnedClinicCardProps) => {
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

  const completeness = clinic.profileCompleteness;
  const isProfileComplete = completeness.missingKeys.length === 0;
  const missingContact = completeness.missingKeys.includes("contact");
  const nudge = getClinicProfileCompletenessNudgeDa(completeness.missingKeys);
  const ariaSummary = getClinicProfileCompletenessAriaDa(completeness);
  const showMessageRow = missingContact || nudge.length > 0;
  const clinicEditHref = `/dashboard/clinic/${clinic.clinics_id}/edit`;
  const showPartialProfileMotivation =
    completeness.completedCount >= 1 &&
    completeness.completedCount < completeness.totalCount;

  const missingProfileTooltip = (
    <TooltipContent className="max-w-xs">
      <p className="mb-2 text-xs font-semibold text-gray-900">
        Mangler på profilen
      </p>
      <ul className="list-disc space-y-1 pl-4 text-left text-sm">
        {completeness.missingKeys.map((key) => (
          <li key={key}>{clinicProfileChecklistDetailLabelsDa[key]}</li>
        ))}
      </ul>
    </TooltipContent>
  );

  return (
    <div className="border rounded-lg p-6 bg-white space-y-4">
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

      <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3">
        {isProfileComplete ? (
          <div className="flex items-start gap-2">
            <CheckCircle2
              className="h-5 w-5 shrink-0 text-green-600"
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Klinik profil er komplet
              </p>
              <p className="text-sm text-gray-600">
                En komplet profil gør jer mere attraktive for patienter.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-gray-900">Klinikprofil</p>
              <p className="text-sm tabular-nums text-gray-600">
                {completeness.completedCount} af {completeness.totalCount}
              </p>
            </div>
            <div
              role="progressbar"
              aria-label={ariaSummary}
              aria-valuenow={completeness.completedCount}
              aria-valuemin={0}
              aria-valuemax={completeness.totalCount}
              aria-valuetext={ariaSummary}
              className="flex gap-1.5"
            >
              {Array.from({ length: completeness.totalCount }, (_, index) => (
                <div
                  key={index}
                  aria-hidden
                  className={cn(
                    "h-2.5 min-w-0 flex-1 rounded-full transition-colors",
                    index < completeness.completedCount
                      ? clinicProfileProgressFilledClass(
                          completeness.completedCount
                        )
                      : "bg-brand-beige"
                  )}
                />
              ))}
            </div>
            {showMessageRow ? (
              missingContact ? (
                <div className="flex gap-2.5">
                  <AlertTriangle
                    className="h-5 w-5 shrink-0 text-amber-500"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="cursor-help text-sm font-medium leading-relaxed text-amber-900 underline decoration-dotted underline-offset-2">
                            {CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA}
                          </p>
                        </TooltipTrigger>
                        {missingProfileTooltip}
                      </Tooltip>
                    </TooltipProvider>
                    <Link
                      href={clinicEditHref}
                      className="inline-flex text-sm font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-sm"
                    >
                      {CLINIC_PROFILE_CONTACT_ADD_INFO_CTA_DA}
                    </Link>
                  </div>
                </div>
              ) : (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="cursor-help text-sm leading-relaxed text-gray-600 underline decoration-dotted underline-offset-2">
                        {nudge}
                      </p>
                    </TooltipTrigger>
                    {missingProfileTooltip}
                  </Tooltip>
                </TooltipProvider>
              )
            ) : null}
            {showPartialProfileMotivation ? (
              <div className="flex items-start gap-2 pt-1">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
                  aria-hidden
                />
                <p className="text-sm leading-relaxed text-gray-600">
                  Klinikker med en udfyldt profil får flere patienter
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Button
          asChild
          variant="outline"
          className="w-fit justify-start"
        >
          <Link href={clinicEditHref}>
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
