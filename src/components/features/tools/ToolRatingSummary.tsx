import { StarRating } from "@/components/ui/star-rating";
import { PublishedToolRating } from "@/lib/tools/tool-ratings";

interface ToolRatingSummaryProps {
  rating?: PublishedToolRating | null;
  className?: string;
}

/**
 * Displays the same rating the tool publishes in its JSON-LD, so the visible
 * number can never drift from the marked-up one. Renders nothing for tools that
 * publish no rating yet.
 */
export function ToolRatingSummary({
  rating,
  className,
}: ToolRatingSummaryProps) {
  if (!rating) return null;

  return (
    <StarRating
      value={Number(rating.ratingValue)}
      count={Number(rating.reviewCount)}
      className={className}
    />
  );
}
