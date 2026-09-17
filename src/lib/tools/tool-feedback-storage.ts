// Client-side memory for the tool feedback widget: who this visitor is, and
// which tools they have already answered for.

import { ToolSlug } from "./registry";

const CLIENT_ID_KEY = "fysfinder_client_id";
const RESPONSES_KEY = "fysfinder_tool_feedback_v1";
const DISMISSAL_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export type FeedbackStatus = "submitted" | "dismissed";

type StoredResponses = Partial<Record<ToolSlug, { status: FeedbackStatus; at: number }>>;

function readResponses(): StoredResponses {
  try {
    const raw = window.localStorage.getItem(RESPONSES_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as StoredResponses) : {};
  } catch {
    return {};
  }
}

export function getClientId(): string {
  try {
    const existing = window.localStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;

    const generated =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

    window.localStorage.setItem(CLIENT_ID_KEY, generated);
    return generated;
  } catch {
    // Private-mode browsers with storage disabled still get to submit; they just
    // are not deduplicated across visits.
    return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

export function shouldAskForFeedback(slug: ToolSlug): boolean {
  try {
    const entry = readResponses()[slug];
    if (!entry) return true;
    if (entry.status === "submitted") return false;
    return Date.now() - entry.at > DISMISSAL_COOLDOWN_MS;
  } catch {
    return true;
  }
}

export function rememberFeedbackResponse(
  slug: ToolSlug,
  status: FeedbackStatus
): void {
  try {
    const responses = readResponses();
    responses[slug] = { status, at: Date.now() };
    window.localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
  } catch {
    // Storage is best-effort; failing to remember only risks asking again later.
  }
}
