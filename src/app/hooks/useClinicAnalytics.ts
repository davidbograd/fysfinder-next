// Hook for tracking clinic interactions (GA4 + first-party database tracking)
// Updated: includes optional city context metadata for suburb-level attribution

import { trackClinicEvent } from "@/lib/tracking";

interface ClinicAnalyticsProps {
  clinicName: string;
  clinicId?: string;
  contextCityId?: string | null;
}

const INTERACTION_TO_EVENT_TYPE = {
  website: "website_click",
  phone: "phone_click",
  email: "email_click",
  booking: "booking_click",
} as const;

export function useClinicAnalytics({
  clinicName,
  clinicId,
  contextCityId,
}: ClinicAnalyticsProps) {
  const trackClinicInteraction = (
    interactionType: "website" | "phone" | "email" | "booking"
  ) => {
    // GA4 tracking
    if (typeof window !== "undefined" && "gtag" in window) {
      const eventParams = {
        event_category: "clinic_interaction",
        event_label: interactionType,
        clinic_name: clinicName,
        clinic_id: clinicId,
        interaction_type: interactionType,
      };

      (window as any).gtag("event", "clinic_contact_click", eventParams);
    }

    // First-party tracking to our database
    if (clinicId) {
      trackClinicEvent({
        clinicId,
        eventType: INTERACTION_TO_EVENT_TYPE[interactionType],
        metadata: {
          source: "profile_sidebar",
          ...(contextCityId ? { context_city_id: contextCityId } : {}),
        },
      });
    }
  };

  return {
    trackWebsiteClick: () => trackClinicInteraction("website"),
    trackPhoneClick: () => trackClinicInteraction("phone"),
    trackEmailClick: () => trackClinicInteraction("email"),
    trackBookingClick: () => trackClinicInteraction("booking"),
  };
}
