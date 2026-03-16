// Client-side utility for sending clinic events to our tracking API
// Updated: bot filtering, session dedup for views/impressions, skip non-production environments

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

const BOT_PATTERN = /bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck|facebookexternalhit|linkedinbot|prerender|headless|phantomjs|lighthouse/i;

const DEDUP_EVENT_TYPES: ClinicEventType[] = [
  "profile_view",
  "list_impression",
];

const isProduction = () => {
  const hostname = window.location.hostname;
  return hostname === "www.fysfinder.dk" || hostname === "fysfinder.dk";
};

const hasAlreadyTracked = (clinicId: string, eventType: ClinicEventType): boolean => {
  try {
    const key = `tracked:${eventType}:${clinicId}`;
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, "1");
    return false;
  } catch {
    return false;
  }
};

export const trackClinicEvent = ({
  clinicId,
  eventType,
  metadata,
}: TrackEventParams) => {
  if (typeof window === "undefined") return;
  if (!isProduction()) return;
  if (BOT_PATTERN.test(navigator.userAgent)) return;
  if (DEDUP_EVENT_TYPES.includes(eventType) && hasAlreadyTracked(clinicId, eventType)) return;

  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clinicId, eventType, metadata }),
    keepalive: true,
  }).catch(() => {
    // Silently ignore — tracking should never break the user experience
  });
};
