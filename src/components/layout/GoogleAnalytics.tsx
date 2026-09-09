// Loads Google Analytics on every visit with Consent Mode v2 defaults.
// Updated: 2026-09-10 - Always load gtag; deny storage until the visitor accepts cookies.

"use client";

import Script from "next/script";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  DENIED_ANALYTICS_CONSENT,
  GRANTED_ANALYTICS_CONSENT,
} from "@/lib/cookie-consent";

export const GA_MEASUREMENT_ID = "G-BH38ZB6HYH";

export function getGtagBootstrapScript(measurementId: string): string {
  const defaultConsent = {
    ...DENIED_ANALYTICS_CONSENT,
    wait_for_update: 500,
  };

  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', ${JSON.stringify(defaultConsent)});
    if (document.cookie.split(';').some(function (part) {
      return part.trim() === '${COOKIE_CONSENT_COOKIE_NAME}=true';
    })) {
      gtag('consent', 'update', ${JSON.stringify(GRANTED_ANALYTICS_CONSENT)});
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
