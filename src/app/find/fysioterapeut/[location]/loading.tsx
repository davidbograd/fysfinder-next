// Location-page loading skeleton.
// Updated: 2026-11-01 - Box heights match the live header, search bar, filter tab and specialty row so nothing shifts on load.

import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpecialtiesList } from "@/app/find/fysioterapeut/[location]/components/LoadingSpecialtiesList";

const FILTER_CHIP_WIDTHS = ["w-[165px]", "w-[162px]", "w-[165px]"];

function ClinicCardSkeleton() {
  return (
    <div className="flex w-full flex-col rounded-lg border border-gray-200 bg-white p-6 sm:flex-row sm:gap-4">
      <Skeleton className="mb-3 h-12 w-12 shrink-0 rounded-lg sm:mb-0 sm:h-16 sm:w-16" />
      <div className="min-w-0 flex-grow">
        <div className="mb-2 flex h-7 items-center">
          <Skeleton className="h-5 w-3/5" />
        </div>
        <div className="mb-3 flex h-6 items-center">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="mb-3 flex h-6 items-center">
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex h-6 gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-10 w-full rounded-full" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="w-full">
      <div className="max-w-[800px] mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-6 flex h-5 items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Title wraps to two lines on mobile */}
        <div className="mb-2 flex h-16 flex-col justify-center gap-2 md:h-9">
          <Skeleton className="h-7 w-full md:w-3/4" />
          <Skeleton className="h-7 w-1/2 md:hidden" />
        </div>
        <div className="mb-8 flex h-6 items-center">
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Search bar, filter tab and mobile Find button — mirrors SearchInterface with showFilters */}
        <div className="mb-4">
          <Skeleton className="h-[115px] w-full rounded-xl md:h-[62px] md:rounded-full" />
          <div
            data-testid="filter-tab-skeleton"
            className="mx-3 flex flex-wrap gap-2 rounded-b-2xl border border-t-0 border-[#d8ddd9] bg-[#f2f1ec] p-2.5 md:mx-8"
          >
            {FILTER_CHIP_WIDTHS.map((width, i) => (
              <Skeleton key={i} className={`h-[34px] rounded-full ${width}`} />
            ))}
          </div>
          <Skeleton className="mt-4 h-[52px] w-full rounded-full md:hidden" />
        </div>

        <LoadingSpecialtiesList />
      </div>

      {/* Results + map — same grid template as the loaded location page */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <div className="mb-4 flex h-5 items-center">
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <ClinicCardSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="self-start xl:sticky xl:top-24">
          <Skeleton className="h-[380px] w-full rounded-xl md:h-[520px]" />
        </div>
      </div>
    </div>
  );
}
