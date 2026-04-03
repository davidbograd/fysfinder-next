// Client-side utility for sending clinic events to our tracking API.
// Updated: adds sendBeacon-first transport plus event/session IDs for more reliable attribution.

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
  metadata?: Record<string, string | number | boolean | null>;
}

const BOT_PATTERN = /bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck|facebookexternalhit|linkedinbot|prerender|headless|phantomjs|lighthouse/i;

const DEDUP_EVENT_TYPES: ClinicEventType[] = [
  "profile_view",
  "list_impression",
];
const BEACON_EVENT_TYPES: ClinicEventType[] = [
  "phone_click",
  "website_click",
  "email_click",
  "booking_click",
];
const SESSION_STORAGE_KEY = "fysfinder:tracking:session_id";
const TRACK_RETRY_DELAY_MS = 250;

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

const getOrCreateSessionId = (): string | null => {
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, generated);
    return generated;
  } catch {
    return null;
  }
};

const createEventId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const postWithFetch = (
  payload: Record<string, unknown>,
  shouldRetry = true
) => {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    if (!shouldRetry) return;

    window.setTimeout(() => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Silently ignore — tracking should never break the user experience
      });
    }, TRACK_RETRY_DELAY_MS);
  });
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

  const eventId = createEventId();
  const sessionId = getOrCreateSessionId();
  const finalMetadata = {
    ...(metadata || {}),
    ...(sessionId ? { session_id: sessionId } : {}),
  };
  const payload = {
    clinicId,
    eventType,
    eventId,
    metadata: finalMetadata,
  };

  if (
    BEACON_EVENT_TYPES.includes(eventType) &&
    typeof navigator.sendBeacon === "function"
  ) {
    try {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      const didQueue = navigator.sendBeacon("/api/track", blob);
      if (didQueue) return;
    } catch {
      // Fall through to fetch path.
    }
  }

  postWithFetch(payload);
};
