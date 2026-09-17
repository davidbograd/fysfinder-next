// Location-page loading skeleton.
// Updated: 2026-09-17 - Match the live header + list/map layout so the skeleton is not stuck in a narrow centered column on desktop.

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <div className="max-w-[800px] mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Title and intro */}
        <Skeleton className="mb-2 h-8 w-3/4 md:h-9" />
        <Skeleton className="mb-4 h-5 w-2/3" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-8 h-4 w-5/6" />

        {/* Search bar and filters */}
        <Skeleton className="mb-4 h-14 w-full rounded-xl md:rounded-full" />
        <div className="flex gap-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Results + map — same grid template as the loaded location page */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <Skeleton className="mb-4 h-4 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
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
