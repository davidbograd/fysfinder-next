import { StarIcon } from "@heroicons/react/24/solid";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** Average rating on a 1-5 scale. */
  value: number;
  /** How many ratings the average covers. Omit to show the value on its own. */
  count?: number;
  className?: string;
}

function formatRatingValue(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

export function StarRating({ value, count, className }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)}>
      <StarIcon className="size-4 flex-shrink-0 text-amber-500" />
      <span className="font-semibold text-gray-700">
        {formatRatingValue(value)}
      </span>
      {count !== undefined && (
        <span className="text-gray-500">({count} anmeldelser)</span>
      )}
    </div>
  );
}
