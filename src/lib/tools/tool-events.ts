// Counts tool interactions (stored in tool_events via /api/tool-event) and
// mirrors them to Google Analytics.

import { ToolSlug } from "./registry";
import { getClientId } from "./tool-feedback-storage";

export const TOOL_EVENT_TYPES = ["result_download"] as const;
export type ToolEventType = (typeof TOOL_EVENT_TYPES)[number];

export function trackToolEvent(
  toolSlug: ToolSlug,
  eventType: ToolEventType,
  variant?: string
): void {
  if (typeof window === "undefined") return;

  window.gtag?.("event", eventType, {
    event_category: "Tools",
    event_label: toolSlug,
    ...(variant ? { variant } : {}),
  });

  const body = JSON.stringify({
    toolSlug,
    eventType,
    variant,
    clientId: getClientId(),
  });

  // A beacon survives the navigation a download link can trigger.
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    if (navigator.sendBeacon("/api/tool-event", body)) return;
  }

  void fetch("/api/tool-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
