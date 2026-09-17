// Reads the real star ratings for a tool during ISR rendering.
//
// Every failure path returns empty stats on purpose: with no real ratings the
// published markup falls back to each tool's existing baseline, so a database
// hiccup can never strip an aggregateRating that Google already indexed.

import { createStaticClient } from "@/app/utils/supabase/static";
import { ToolSlug } from "./registry";
import { EMPTY_TOOL_RATING_STATS, ToolRatingStats } from "./tool-ratings";

interface ToolRatingStatsRow {
  tool_slug: string;
  rating_count: number | string | null;
  rating_sum: number | string | null;
}

function toCount(value: number | string | null): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
}

export async function getToolRatingStats(
  slug: ToolSlug
): Promise<ToolRatingStats> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.rpc("get_tool_rating_stats");

    if (error || !Array.isArray(data)) {
      return EMPTY_TOOL_RATING_STATS;
    }

    const row = (data as ToolRatingStatsRow[]).find(
      (candidate) => candidate.tool_slug === slug
    );

    if (!row) return EMPTY_TOOL_RATING_STATS;

    return {
      ratingCount: toCount(row.rating_count),
      ratingSum: toCount(row.rating_sum),
    };
  } catch {
    return EMPTY_TOOL_RATING_STATS;
  }
}
