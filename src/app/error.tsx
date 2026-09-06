// Root error boundary so non-location routes get the same branded error UI.
// Added: 2026-09-06 - Matches the location-page error state (green pill buttons).

"use client";

import { useEffect } from "react";
import { PageErrorState } from "@/components/layout/PageErrorState";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <PageErrorState onRetry={reset} />;
}
