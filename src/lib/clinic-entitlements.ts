// Shared entitlement and ranking policy helpers for clinic visibility and dashboard access.
// Updated: centralizes premium-active checks, verified-priority sorting, and nearby-rank access gating.

import { PremiumListing } from "@/app/types";

export type RankingContext =
  | "danmark"
  | "online"
  | "city"
  | "city-specialty"
  | "nearby";

interface RankingPolicy {
  prioritizePremium: boolean;
  prioritizeVerifiedSignedUp: boolean;
}

interface RankingClinic {
  avgRating: number | null;
  ratingCount: number | null;
  premium_listing?: PremiumListing | null;
  verified_klinik?: boolean | null;
}

interface PremiumAccessCarrier {
  premium_listing?: PremiumListing | null;
  premium_listings?: Array<Pick<PremiumListing, "start_date" | "end_date">> | null;
}

interface VerifiedStatusCarrier {
  verified_klinik?: boolean | null;
}

const RANKING_POLICY_BY_CONTEXT: Record<RankingContext, RankingPolicy> = {
  danmark: { prioritizePremium: false, prioritizeVerifiedSignedUp: false },
  online: { prioritizePremium: true, prioritizeVerifiedSignedUp: false },
  city: { prioritizePremium: true, prioritizeVerifiedSignedUp: true },
  "city-specialty": { prioritizePremium: true, prioritizeVerifiedSignedUp: true },
  nearby: { prioritizePremium: true, prioritizeVerifiedSignedUp: false },
};

export const FEATURE_FLAGS = {
  verifiedPriorityInCityListings: true,
} as const;

export function getRankingPolicy(context: RankingContext): RankingPolicy {
  const policy = RANKING_POLICY_BY_CONTEXT[context];
  if (!FEATURE_FLAGS.verifiedPriorityInCityListings) {
    return { ...policy, prioritizeVerifiedSignedUp: false };
  }
  return policy;
}

export function isPremiumListingActive(
  premiumListing: Pick<PremiumListing, "start_date" | "end_date"> | null | undefined
): boolean {
  if (!premiumListing) return false;
  const now = new Date();
  return (
    new Date(premiumListing.start_date) <= now &&
    new Date(premiumListing.end_date) > now
  );
}

export function hasVerifiedSignupPriority(
  clinic: VerifiedStatusCarrier
): boolean {
  return Boolean(clinic.verified_klinik);
}

export function canAccessNearbyCityRanking(carrier: PremiumAccessCarrier): boolean {
  if (carrier.premium_listing) return isPremiumListingActive(carrier.premium_listing);
  if (!carrier.premium_listings || carrier.premium_listings.length === 0) return false;
  return carrier.premium_listings.some((listing) => isPremiumListingActive(listing));
}

export function canAccessTeamMembersFeature(): boolean {
  // Team members stay available for all claimed clinics regardless of premium status.
  return true;
}

export function sortClinicsByPolicy<T extends RankingClinic>(
  clinics: T[],
  policy: RankingPolicy
): T[] {
  return [...clinics].sort((a, b) => {
    if (policy.prioritizePremium) {
      const aPremium = isPremiumListingActive(a.premium_listing);
      const bPremium = isPremiumListingActive(b.premium_listing);
      if (aPremium !== bPremium) return bPremium ? 1 : -1;
    }

    if (policy.prioritizeVerifiedSignedUp) {
      const aVerified = hasVerifiedSignupPriority(a);
      const bVerified = hasVerifiedSignupPriority(b);
      if (aVerified !== bVerified) return bVerified ? 1 : -1;
    }

    const ratingA = a.avgRating || 0;
    const ratingB = b.avgRating || 0;
    if (ratingA !== ratingB) return ratingB - ratingA;

    const countA = a.ratingCount || 0;
    const countB = b.ratingCount || 0;
    return countB - countA;
  });
}
