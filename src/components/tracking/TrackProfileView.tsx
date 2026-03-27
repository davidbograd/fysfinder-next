// Invisible client component that tracks a clinic profile view on mount
// Updated: supports optional attribution metadata for suburb-level analytics

"use client";

import { useEffect, useRef } from "react";
import { trackClinicEvent } from "@/lib/tracking";

interface TrackProfileViewProps {
  clinicId: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export const TrackProfileView = ({ clinicId, metadata }: TrackProfileViewProps) => {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    trackClinicEvent({
      clinicId,
      eventType: "profile_view",
      metadata,
    });
  }, [clinicId, metadata]);

  return null;
};
