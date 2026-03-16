// Hook for tracking clinic interactions (GA4 + first-party database tracking)
// Updated: added first-party event tracking alongside GA4 for dashboard analytics

import { trackClinicEvent } from "@/lib/tracking";

interface ClinicAnalyticsProps {
  clinicName: string;
  clinicId?: string;
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
