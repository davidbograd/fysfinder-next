// Loads Google Analytics only after the visitor has accepted analytics cookies.
// Updated: 2026-09-06 - Avoid downloading gtag.js on every anonymous first visit.

"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_ACCEPTED_EVENT,
  hasGrantedAnalyticsConsent,
} from "@/lib/cookie-consent";

const GA_MEASUREMENT_ID = "G-BH38ZB6HYH";

export function GoogleAnalytics() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (hasGrantedAnalyticsConsent(document.cookie)) {
      setIsEnabled(true);
    }

    const handleAccepted = () => setIsEnabled(true);
    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, handleAccepted);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, handleAccepted);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
