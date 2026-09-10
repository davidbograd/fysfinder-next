// Loads Google Analytics on every visit. Consent Mode defaults to granted so
// unanswered banners still appear in GA Realtime, matching pre-weekend measurement.
// Updated: 2026-09-10 - Deny storage only after an explicit "Kun nødvendige" choice.

import Script from "next/script";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  DENIED_ANALYTICS_CONSENT,
  GRANTED_ANALYTICS_CONSENT,
} from "@/lib/cookie-consent";

export const GA_MEASUREMENT_ID = "G-BH38ZB6HYH";

export function getGtagBootstrapScript(measurementId: string): string {
  const defaultConsent = {
    ...GRANTED_ANALYTICS_CONSENT,
    wait_for_update: 500,
  };

  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', ${JSON.stringify(defaultConsent)});
    if (document.cookie.split(';').some(function (part) {
      return part.trim() === '${COOKIE_CONSENT_COOKIE_NAME}=false';
    })) {
      gtag('consent', 'update', ${JSON.stringify(DENIED_ANALYTICS_CONSENT)});
    }
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
}

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {getGtagBootstrapScript(GA_MEASUREMENT_ID)}
      </Script>
    </>
  );
}
