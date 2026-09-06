// Shared entitlement and ranking policy helpers for clinic visibility and dashboard access.
// Updated: centralizes premium-active checks, verified-priority sorting, and nearby-rank access gating.

import { PremiumListing } from "@/app/types";

export type RankingContext =
  | "danmark"
  | "danmark-specialty"
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
  // Only the active-window dates are read here, so callers need not carry a full listing.
  premium_listing?: Pick<PremiumListing, "start_date" | "end_date"> | null;
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
  // The unfiltered Danmark listing is a nationwide roll-up of every clinic, so it stays
  // purely rating-ranked. A specialty filter narrows it to a comparable shortlist, which
  // is a placement premium clinics pay for.
  danmark: { prioritizePremium: false, prioritizeVerifiedSignedUp: false },
  "danmark-specialty": { prioritizePremium: true, prioritizeVerifiedSignedUp: false },
  online: { prioritizePremium: true, prioritizeVerifiedSignedUp: false },
  city: { prioritizePremium: true, prioritizeVerifiedSignedUp: true },
  "city-specialty": { prioritizePremium: true, prioritizeVerifiedSignedUp: true },
  nearby: { prioritizePremium: true, prioritizeVerifiedSignedUp: false },
};

export const FEATURE_FLAGS = {
  verifiedPriorityInCityListings: true,
} as const;

/**
 * Confidence level the ranking demands of a rating, as a z-score. Raising it makes the
 * ranking trust thin review counts less, pushing clinics with a handful of reviews further
 * down; lowering it moves the ranking back toward the face-value rating.
 */
export const RATING_CONFIDENCE_Z = 1;

const MIN_STARS = 1;
const MAX_STARS = 5;

/**
 * Lower bound of the Wilson score interval for a clinic's rating: roughly "the rating we
 * are confident this clinic is at least worth", so a rating counts for as much as its
 * review volume can support. Ranking on the raw average let a single 5-star review outrank
 * a clinic with 100 reviews at 4.9.
 *
 * The property that matters is monotonicity in review count: for a given rating, more
 * reviews can only ever raise the score. A Bayesian average toward the corpus mean does not
 * have it — shrinkage works in both directions, so among clinics rated below the mean the
 * ones with fewest reviews got the largest lift, and a 4.3 with 15 reviews outranked a 4.4
 * with 59. Anchoring at the bottom of the interval instead removes that whole class of
 * inversion.
 *
 * Returns null for clinics with no reviews so callers can rank them below every rated
 * clinic rather than scoring them as though they had been reviewed.
 */
export function getWeightedRatingScore(
  avgRating: number | string | null | undefined,
  ratingCount: number | string | null | undefined
): number | null {
  // The nearby-clinics RPC returns these Postgres numerics as strings.
  const rating = Number(avgRating);
  const count = Number(ratingCount);
  if (!Number.isFinite(rating) || !Number.isFinite(count)) return null;
  if (count <= 0 || rating <= 0) return null;

  // Wilson works on a success rate, so map the star average onto 0-1. Clamped because a
  // rating outside the star range would otherwise put a negative under the square root.
  const proportion = Math.min(
    Math.max((rating - MIN_STARS) / (MAX_STARS - MIN_STARS), 0),
    1
  );

  const z = RATING_CONFIDENCE_Z;
  const zSquared = z * z;
  const centre = proportion + zSquared / (2 * count);
  const margin =
    z *
    Math.sqrt(
      (proportion * (1 - proportion) + zSquared / (4 * count)) / count
    );

  return (centre - margin) / (1 + zSquared / count);
}

/**
 * Maps a location page URL to its ranking context. Kept beside the policy table so the
 * danmark vs. danmark-specialty distinction stays visible in one place.
 */
export function getPrimaryRankingContext(
  locationSlug: string,
  specialtySlug?: string
): RankingContext {
  if (locationSlug === "danmark")
    return specialtySlug ? "danmark-specialty" : "danmark";
  if (locationSlug === "online") return "online";
  if (specialtySlug) return "city-specialty";
  return "city";
}

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

/**
 * Picks the listing that decides a clinic's premium status. A clinic can hold several
 * listings (an expired one plus a renewal), and the database returns them in no
 * meaningful order, so never rely on the first element: an active listing must win over
 * a stale one or a paying clinic silently loses its premium treatment. Falls back to the
 * first listing so callers still see the historical listing when none is active.
 */
export function resolvePremiumListing<
  T extends Pick<PremiumListing, "start_date" | "end_date">
>(listings: T[] | null | undefined): T | null {
  if (!listings || listings.length === 0) return null;
  return listings.find((listing) => isPremiumListingActive(listing)) ?? listings[0];
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

    const scoreA = getWeightedRatingScore(a.avgRating, a.ratingCount);
    const scoreB = getWeightedRatingScore(b.avgRating, b.ratingCount);

    // Unrated clinics have no score and rank below every rated clinic.
    if (scoreA === null || scoreB === null) {
      if (scoreA !== scoreB) return scoreA === null ? 1 : -1;
    } else if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    const countA = Number(a.ratingCount) || 0;
    const countB = Number(b.ratingCount) || 0;
    return countB - countA;
  });
}
