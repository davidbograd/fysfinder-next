"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { TeamMember, PremiumListing } from "@/app/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  team_members?: TeamMember[];
  premium_listing?: PremiumListing | null;
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
  ydernummer,
  avgRating,
  ratingCount,
  adresse,
  postnummer,
  lokation,
  distance,
  specialties = [],
  team_members = [],
  premium_listing,
}) => {
  const MAX_VISIBLE_MEMBERS = 5;
  const hasMoreMembers = team_members.length > MAX_VISIBLE_MEMBERS;
  const visibleMembers = team_members.slice(0, MAX_VISIBLE_MEMBERS);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const isPremium = isPremiumActive(premium_listing);

  return (
    <div
      className={cn(
        "p-6 rounded-lg transition-all duration-200 bg-white w-full",
        isPremium
          ? "border-2 border-logo-blue/30 shadow-md hover:shadow-lg scale-[1.02] bg-gradient-to-r from-logo-blue/5 to-white"
          : "border border-gray-200 hover:shadow-md"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div className="flex-grow">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {klinikNavn}
            </h3>
            {isPremium && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-logo-blue/10 text-logo-blue border-logo-blue/20"
              >
                Sponsoreret
              </Badge>
            )}
          </div>
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
            <div className="flex items-center">
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
