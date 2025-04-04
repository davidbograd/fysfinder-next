interface ClinicAnalyticsProps {
  clinicName: string;
  clinicId?: string;
}

export function useClinicAnalytics({
  clinicName,
  clinicId,
}: ClinicAnalyticsProps) {
  const trackClinicInteraction = (
    interactionType: "website" | "phone" | "email" | "booking"
  ) => {
    // Ensure gtag is available
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
  };

  return {
    trackWebsiteClick: () => trackClinicInteraction("website"),
    trackPhoneClick: () => trackClinicInteraction("phone"),
    trackEmailClick: () => trackClinicInteraction("email"),
    trackBookingClick: () => trackClinicInteraction("booking"),
  };
}
