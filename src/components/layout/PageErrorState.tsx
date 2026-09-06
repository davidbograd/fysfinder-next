// Shared full-page error UI used by Next.js error.tsx boundaries.
// Updated: 2026-09-06 - Brand-green pill buttons instead of the old blue rounded-md styles.

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageErrorStateProps {
  onRetry: () => void;
}

export function PageErrorState({ onRetry }: PageErrorStateProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-balance text-3xl font-semibold text-[#1f2b28]">
        Noget gik galt
      </h1>
      <p className="mt-4 max-w-md text-pretty text-gray-600">
        Der opstod en fejl under indlæsning af siden. Prøv igen senere.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onRetry}>Prøv igen</Button>
        <Button asChild variant="link">
          <Link href="/">Gå til forsiden</Link>
        </Button>
      </div>
    </div>
  );
}
