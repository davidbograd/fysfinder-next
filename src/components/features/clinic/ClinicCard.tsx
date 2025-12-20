"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { TeamMember, PremiumListing } from "@/app/types";
import { useState, useEffect } from "react";
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
import { getCachedLogoPath } from "@/lib/logo-cache";
import VerifiedCheck from "@/assets/icons/verified-check.svg";

interface Props {
  klinikNavn: string;
  klinikNavnSlug: string;
  ydernummer: boolean;
  avgRating: number;
  ratingCount: number;
  adresse: string;
  postnummer: number;
  lokation: string;
  website?: string;
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
}

function isPremiumActive(
  premium_listing: PremiumListing | null | undefined
): boolean {
  if (!premium_listing) return false;
  const now = new Date();
  return (
    new Date(premium_listing.start_date) <= now &&
    new Date(premium_listing.end_date) > now
  );
}

const ClinicCard: React.FC<Props> = ({
  klinikNavn,
  klinikNavnSlug,
  ydernummer,
  avgRating,
  ratingCount,
  adresse,
  postnummer,
  lokation,
  website,
  tlf,
  distance,
  specialties = [],
  team_members = [],
  premium_listing,
  handicapadgang,
  verified_klinik,
}) => {
  const MAX_VISIBLE_MEMBERS = 5;
  const hasMoreMembers = team_members.length > MAX_VISIBLE_MEMBERS;
  const visibleMembers = team_members.slice(0, MAX_VISIBLE_MEMBERS);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [cachedLogoPath, setCachedLogoPath] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const isPremium = isPremiumActive(premium_listing);
  const hasLogo = logoLoaded && Boolean(cachedLogoPath);

  // Load cached logo path on mount
  useEffect(() => {
    if (website) {
      getCachedLogoPath(website).then((logoPath) => {
        setCachedLogoPath(logoPath);
        setLogoLoaded(true);
      });
    } else {
      setLogoLoaded(true);
    }
  }, [website]);

  return (
    <div
      className={cn(
        "p-6 rounded-lg bg-white w-full",
        isPremium
          ? "border-2 border-logo-blue/30 shadow-md scale-[1.02] bg-gradient-to-r from-logo-blue/5 to-white"
          : "border border-gray-200"
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
              {hasLogo && cachedLogoPath ? (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <Image
                    src={cachedLogoPath}
                    alt={`${klinikNavn} logo`}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
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
            <div className="flex items-start gap-2 mb-2">
              <Link
                href={`/klinik/${klinikNavnSlug}`}
                className="hover:opacity-90 transition-opacity duration-200"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {klinikNavn}
                </h3>
              </Link>
              {/* Verified Icon */}
              {verified_klinik && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src={VerifiedCheck}
                        alt="Verified clinic"
                        width={20}
                        height={20}
                        className="w-5 h-5 mt-1"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Denne klinik er verificeret af Fysfinder.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {/* Accessibility Icon */}
              {handicapadgang && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <FaWheelchair className="w-5 h-5 text-logo-blue mt-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Handicapadgang</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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
                {website && <WebsiteButton website={website} />}
                {tlf && <PhoneButton phoneNumber={tlf} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicCard;
