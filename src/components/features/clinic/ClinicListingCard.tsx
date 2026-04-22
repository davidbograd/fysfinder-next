// ClinicListingCard - Displays a single clinic in search/listing results.
// Updated: reuses shared premium-active entitlement helper for card prominence.

"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { TeamMember, PremiumListing } from "@/app/types";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FaWheelchair } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WebsiteButton } from "@/components/WebsiteButton";
import { PhoneButton } from "@/components/PhoneButton";
import Link from "next/link";
import VerifiedCheck from "@/assets/icons/verified-check.svg";
import { trackClinicEvent } from "@/lib/tracking";
import { isPremiumListingActive } from "@/lib/clinic-entitlements";
import { getClinicLogoDisplayUrl } from "@/lib/clinic-logo";

interface Props {
  clinicId?: string;
  klinikNavn: string;
  klinikNavnSlug: string;
  ydernummer: boolean;
  avgRating: number;
  ratingCount: number;
  adresse: string;
  postnummer: number;
  lokation: string;
  website?: string;
  logo_url?: string | null;
  tlf?: string;
  distance?: number;
  specialties?: {
    specialty_name: string;
    specialty_id: string;
  }[];
  team_members?: TeamMember[];
  premium_listing?: PremiumListing | null;
  handicapadgang?: boolean | null;
  verified_klinik?: boolean | null;
  trackingContextCityId?: string;
}

const ClinicListingCard: React.FC<Props> = ({
  clinicId,
  klinikNavn,
  klinikNavnSlug,
  ydernummer,
  avgRating,
  ratingCount,
  adresse,
  postnummer,
  lokation,
  website,
  logo_url,
  tlf,
  distance,
  specialties = [],
  team_members = [],
  premium_listing,
  handicapadgang,
  verified_klinik,
  trackingContextCityId,
}) => {
  const MAX_VISIBLE_MEMBERS = 5;
  const hasMoreMembers = team_members.length > MAX_VISIBLE_MEMBERS;
  const visibleMembers = team_members.slice(0, MAX_VISIBLE_MEMBERS);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const isPremium = isPremiumListingActive(premium_listing);
  const logoPath = getClinicLogoDisplayUrl({
    logoUrl: logo_url,
    website,
  });
  const hasLogo = Boolean(logoPath) && !logoLoadFailed;
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTrackedImpression = useRef(false);
  const [isMapHighlighted, setIsMapHighlighted] = useState(false);

  useEffect(() => {
    setLogoLoadFailed(false);
  }, [logoPath]);

  useEffect(() => {
    if (!clinicId || hasTrackedImpression.current || !cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedImpression.current) {
          hasTrackedImpression.current = true;
          trackClinicEvent({
            clinicId,
            eventType: "list_impression",
            metadata: {
              source: "list_view",
              ...(trackingContextCityId
                ? { context_city_id: trackingContextCityId }
                : {}),
            },
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [clinicId]);

  useEffect(() => {
    if (!clinicId) return;

    const handleMarkerHover = (event: Event) => {
      const customEvent = event as CustomEvent<{ clinicId: string | null }>;
      const highlightedClinicId = customEvent.detail?.clinicId ?? null;
      setIsMapHighlighted(highlightedClinicId === clinicId);
    };

    window.addEventListener(
      "fysfinder:map-marker-hover",
      handleMarkerHover as EventListener
    );

    return () => {
      window.removeEventListener(
        "fysfinder:map-marker-hover",
        handleMarkerHover as EventListener
      );
    };
  }, [clinicId]);

  const handleCardMouseEnter = () => {
    if (!clinicId) return;
    window.dispatchEvent(
      new CustomEvent("fysfinder:clinic-card-hover", {
        detail: { clinicId },
      })
    );
  };

  const handleCardMouseLeave = () => {
    if (!clinicId) return;
    window.dispatchEvent(
      new CustomEvent("fysfinder:clinic-card-hover", {
        detail: { clinicId: null },
      })
    );
  };

  return (
    <div
      ref={cardRef}
      id={clinicId ? `clinic-card-${clinicId}` : undefined}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
      className={cn(
        "p-6 rounded-lg bg-white w-full transition-shadow",
        isPremium
          ? "border-2 border-logo-blue/30 shadow-md scale-[1.02] bg-gradient-to-r from-logo-blue/5 to-white"
          : "border border-gray-200",
        isMapHighlighted && "ring-2 ring-logo-blue/60 shadow-md"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:gap-4 flex-grow">
          {/* Logo */}
          <div
            className={cn(
              "flex-shrink-0",
              hasLogo ? "mb-3 sm:mb-0" : "hidden sm:block sm:mb-0"
            )}
          >
            <Link href={`/klinik/${klinikNavnSlug}`} className="block">
              {hasLogo && logoPath ? (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <Image
                    src={logoPath}
                    alt={`${klinikNavn} logo`}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                    onError={() => setLogoLoadFailed(true)}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg sm:text-2xl font-bold text-gray-400">
                    {klinikNavn.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            {isPremium && (
              <p className="text-gray-600 text-sm mb-1">Sponsoreret</p>
            )}
            <h3 className="mb-2 text-xl font-semibold leading-snug text-gray-900 [overflow-wrap:anywhere]">
              <Link
                href={`/klinik/${klinikNavnSlug}`}
                className="text-inherit hover:opacity-90 transition-opacity duration-200"
              >
                {klinikNavn}
              </Link>
              {verified_klinik && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1.5 inline-block shrink-0 align-middle -translate-y-px">
                        <Image
                          src={VerifiedCheck}
                          alt="Verified clinic"
                          width={20}
                          height={20}
                          className="h-5 w-5"
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Denne klinik er verificeret af Fysfinder.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {handicapadgang && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1.5 inline-block shrink-0 align-middle -translate-y-px text-logo-blue">
                        <FaWheelchair
                          className="h-5 w-5"
                          aria-label="Handicapadgang"
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Handicapadgang</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </h3>
            <Link
              href={`/klinik/${klinikNavnSlug}`}
              className="flex items-center mb-3 hover:opacity-90 transition-opacity duration-200 w-fit"
            >
              <StarIcon className="size-5 mr-2 flex-shrink-0 text-amber-500" />
              <div className="flex items-center">
                <span className="text-gray-700 mr-2 font-semibold">
                  {avgRating && avgRating > 0 ? avgRating.toFixed(1) : "-"}
                </span>
                <span className="text-gray-500">
                  ({ratingCount} anmeldelser)
                </span>
              </div>
            </Link>
            <Link
              href={`/klinik/${klinikNavnSlug}`}
              className={`flex items-center text-gray-500 hover:opacity-90 transition-opacity duration-200 w-fit ${
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
            </Link>

            {specialties.length > 0 && (
              <div
                className={`flex flex-wrap gap-2 ${
                  ydernummer || team_members.length > 0 ? "mb-3" : ""
                }`}
              >
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
                className={`inline-flex items-center gap-1 w-auto ${
                  team_members.length > 0 ? "mb-3" : ""
                }`}
              >
                <Check className="size-3 stroke-2 text-logo-blue" />
                Har ydernummer
              </Badge>
            )}

            {/* Team members photos */}
            {team_members.length > 0 && (
              <div className="flex items-center mb-4">
                <div className="flex -space-x-3">
                  {visibleMembers.map((member) => (
                    <div
                      key={member.id}
                      className="relative w-12 h-12 flex-shrink-0"
                    >
                      {member.image_url ? (
                        <>
                          <div
                            className={`absolute inset-0 rounded-full bg-gray-200 animate-pulse ${
                              loadedImages[member.id] ? "hidden" : "block"
                            }`}
                          />
                          <Image
                            src={member.image_url}
                            alt={`${member.name} - ${member.role}`}
                            fill
                            sizes="48px"
                            loading="lazy"
                            className={`rounded-full object-cover border-2 border-white transition-opacity duration-200 ${
                              loadedImages[member.id]
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                            style={{ objectPosition: "center 30%" }}
                            onLoad={() =>
                              setLoadedImages((prev) => ({
                                ...prev,
                                [member.id]: true,
                              }))
                            }
                          />
                        </>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-white" />
                      )}
                    </div>
                  ))}
                  {hasMoreMembers && (
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                      <span className="text-sm text-gray-600 font-medium">
                        +{team_members.length - MAX_VISIBLE_MEMBERS}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact buttons */}
            {(website || tlf) && (
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                {website && (
                  <WebsiteButton
                    website={website}
                    onClick={
                      clinicId
                        ? () =>
                            trackClinicEvent({
                              clinicId,
                              eventType: "website_click",
                              metadata: {
                                source: "list_view",
                                ...(trackingContextCityId
                                  ? { context_city_id: trackingContextCityId }
                                  : {}),
                              },
                            })
                        : undefined
                    }
                  />
                )}
                {tlf && (
                  <PhoneButton
                    phoneNumber={tlf}
                    onClick={
                      clinicId
                        ? () =>
                            trackClinicEvent({
                              clinicId,
                              eventType: "phone_click",
                              metadata: {
                                source: "list_view",
                                ...(trackingContextCityId
                                  ? { context_city_id: trackingContextCityId }
                                  : {}),
                              },
                            })
                        : undefined
                    }
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicListingCard;
