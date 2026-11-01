"use client";

// Placeholder for the "Udforsk … med speciale i" row in the location loading skeleton; hidden on specialty pages, which don't show it.

import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSpecialtiesList() {
  const params = useParams<{ specialty?: string }>();
  if (params?.specialty) return null;

  return (
    <div data-testid="specialties-skeleton" className="mt-6 mb-8 hidden md:block">
      <div className="mb-2 flex h-7 items-center">
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="flex h-7 gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-7 w-24 rounded-full" />
        ))}
      </div>
    </div>
  );
}
