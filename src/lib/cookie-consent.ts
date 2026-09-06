// Cookie consent helpers shared by the banner and analytics loader.
// Updated: 2026-09-06 - Centralize consent cookie name and granted-state parsing.

export const COOKIE_CONSENT_COOKIE_NAME = "fysfinder-cookie-consent";
export const COOKIE_CONSENT_ACCEPTED_EVENT = "fysfinder:cookie-consent-accepted";

export function hasGrantedAnalyticsConsent(cookieHeader: string): boolean {
  return cookieHeader.split(";").some(
    (part) => part.trim() === `${COOKIE_CONSENT_COOKIE_NAME}=true`
  );
}
