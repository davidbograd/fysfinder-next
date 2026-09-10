// Cookie consent helpers shared by the banner and analytics loader.
// Updated: 2026-09-10 - Default Consent Mode to granted so GA Realtime still counts unanswered banners.

export const COOKIE_CONSENT_COOKIE_NAME = "fysfinder-cookie-consent";

export const DENIED_ANALYTICS_CONSENT = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

export const GRANTED_ANALYTICS_CONSENT = {
  analytics_storage: "granted",
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
} as const;

export function hasGrantedAnalyticsConsent(cookieHeader: string): boolean {
  return cookieHeader.split(";").some(
    (part) => part.trim() === `${COOKIE_CONSENT_COOKIE_NAME}=true`
  );
}

export function hasDeclinedAnalyticsConsent(cookieHeader: string): boolean {
  return cookieHeader.split(";").some(
    (part) => part.trim() === `${COOKIE_CONSENT_COOKIE_NAME}=false`
  );
}

export function applyGtagConsentUpdate(granted: boolean): void {
  window.gtag?.("consent", "update", granted ? GRANTED_ANALYTICS_CONSENT : DENIED_ANALYTICS_CONSENT);
}
