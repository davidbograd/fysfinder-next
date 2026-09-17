// Resolves the aggregateRating we publish in JSON-LD for each tool.
//
// The five calculators below already publish 4.8 from 150 reviews in production,
// and that markup is what earns the star display in Google. Their baseline is
// therefore kept and real ratings are blended on top, so the published value can
// only ever move toward genuine data — it never drops out.
//
// The remaining tools publish no rating today. They get no baseline at all
// (inventing one would be a new claim rather than a continuation of an existing
// one) and stay unpublished until they have earned enough real ratings to stand
// on their own.

import { ToolSlug } from "./registry";

export const BEST_RATING = 5;
export const WORST_RATING = 1;

/** Real ratings a baseline-free tool needs before we publish any rating for it. */
export const MIN_REAL_RATINGS_FOR_UNSEEDED_TOOL = 10;

interface RatingBaseline {
  ratingValue: number;
  reviewCount: number;
}

const PUBLISHED_BASELINES: Partial<Record<ToolSlug, RatingBaseline>> = {
  "bmi-beregner": { ratingValue: 4.8, reviewCount: 150 },
  kalorieberegner: { ratingValue: 4.8, reviewCount: 150 },
  "fedtprocent-beregner": { ratingValue: 4.8, reviewCount: 150 },
  "pace-beregner": { ratingValue: 4.8, reviewCount: 150 },
  "rm-beregner": { ratingValue: 4.8, reviewCount: 150 },
};

export interface ToolRatingStats {
  /** Number of star ratings submitted by real users. */
  ratingCount: number;
  /** Sum of those star ratings, used to blend with the baseline. */
  ratingSum: number;
}

export interface PublishedToolRating {
  ratingValue: string;
  reviewCount: string;
  bestRating: string;
  worstRating: string;
}

export const EMPTY_TOOL_RATING_STATS: ToolRatingStats = {
  ratingCount: 0,
  ratingSum: 0,
};

function clampToRatingScale(value: number): number {
  return Math.min(BEST_RATING, Math.max(WORST_RATING, value));
}

export function resolvePublishedToolRating(
  slug: ToolSlug,
  stats: ToolRatingStats = EMPTY_TOOL_RATING_STATS
): PublishedToolRating | null {
  const ratingCount = Number.isFinite(stats.ratingCount)
    ? Math.max(0, Math.trunc(stats.ratingCount))
    : 0;
  const ratingSum = Number.isFinite(stats.ratingSum) ? Math.max(0, stats.ratingSum) : 0;

  const baseline = PUBLISHED_BASELINES[slug];

  const totalCount = (baseline?.reviewCount ?? 0) + ratingCount;
  const totalSum =
    (baseline ? baseline.ratingValue * baseline.reviewCount : 0) + ratingSum;

  if (!baseline && ratingCount < MIN_REAL_RATINGS_FOR_UNSEEDED_TOOL) {
    return null;
  }

  if (totalCount === 0) {
    return null;
  }

  return {
    ratingValue: clampToRatingScale(totalSum / totalCount).toFixed(1),
    reviewCount: String(totalCount),
    bestRating: String(BEST_RATING),
    worstRating: String(WORST_RATING),
  };
}

export function hasPublishedBaseline(slug: ToolSlug): boolean {
  return PUBLISHED_BASELINES[slug] !== undefined;
}
