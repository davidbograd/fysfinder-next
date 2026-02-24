// Client-side utility for sending clinic events to our tracking API
// Fire-and-forget: never blocks UI, silently swallows errors

type ClinicEventType =
  | "profile_view"
  | "list_impression"
  | "phone_click"
  | "website_click"
  | "email_click"
  | "booking_click";

interface TrackEventParams {
  clinicId: string;
  eventType: ClinicEventType;
  metadata?: Record<string, string>;
}

export const trackClinicEvent = ({
  clinicId,
  eventType,
  metadata,
}: TrackEventParams) => {
  if (typeof window === "undefined") return;

  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clinicId, eventType, metadata }),
    keepalive: true,
  }).catch(() => {
    // Silently ignore — tracking should never break the user experience
  });
};
