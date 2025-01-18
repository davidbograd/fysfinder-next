import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-[800px] mx-auto">
        {/* Breadcrumbs skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Title skeleton */}
        <Skeleton className="h-9 w-3/4 mb-2" />

        {/* Description skeleton */}
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-5/6 mb-8" />

        {/* Search and filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="sm:w-64">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Results count skeleton */}
        <Skeleton className="h-4 w-48 mb-4" />

        {/* Clinic cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
