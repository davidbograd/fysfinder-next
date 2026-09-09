// Cookie consent banner for analytics opt-in.
// Updated: 2026-09-10 - Update gtag Consent Mode when the visitor accepts or declines.

"use client";

import { useEffect, useState } from "react";
import CookieConsent from "react-cookie-consent";
import {
  applyGtagConsentUpdate,
  COOKIE_CONSENT_COOKIE_NAME,
} from "@/lib/cookie-consent";

interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);

  // Only render on client side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAccept = () => {
    applyGtagConsentUpdate(true);
  };

  const handleDecline = () => {
    applyGtagConsentUpdate(false);
  };

  if (!mounted) return null;

  return (
    <CookieConsent
      enableDeclineButton
      onAccept={handleAccept}
      onDecline={handleDecline}
      buttonText="Acceptér alle cookies"
      declineButtonText="Kun nødvendige"
      cookieName={COOKIE_CONSENT_COOKIE_NAME}
      expires={150}
      disableStyles={true}
      containerClasses="fixed left-1/2 -translate-x-1/2 bottom-4 max-w-4xl w-full mx-auto bg-white rounded-lg shadow-xl p-4 text-sm flex flex-col sm:flex-row items-center gap-4 sm:items-center sm:justify-between sm:m-4"
      buttonWrapperClasses="flex items-center space-x-2 shrink-0"
      buttonClasses="whitespace-nowrap px-4 py-1.5 rounded-md bg-[#104534] text-white text-xs hover:bg-[#0d3a2b] transition-colors"
      declineButtonClasses="whitespace-nowrap px-4 py-1.5 rounded-md border border-[#104534] text-[#104534] text-xs hover:bg-gray-50 transition-colors"
    >
      <p className="text-gray-700 text-center sm:text-left">
        Vi bruger cookies for at give dig den bedste oplevelse.{" "}
        <a href="/privatlivspolitik" className="text-[#104534] hover:underline">
          Læs mere
        </a>
        .
      </p>
    </CookieConsent>
  );
}
