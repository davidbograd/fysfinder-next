// Invisible client component that tracks a clinic profile view on mount
// Placed on the clinic detail page to record each page load

"use client";

import { useEffect, useRef } from "react";
import { trackClinicEvent } from "@/lib/tracking";

interface TrackProfileViewProps {
  clinicId: string;
}

export const TrackProfileView = ({ clinicId }: TrackProfileViewProps) => {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    trackClinicEvent({
      clinicId,
      eventType: "profile_view",
    });
  }, [clinicId]);

  return null;
};
