"use client";

import { useEffect, useState } from "react";
import CookieConsent from "react-cookie-consent";

interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentBannerProps {
  testMode?: boolean;
}

export function CookieConsentBanner({
  testMode = false,
}: CookieConsentBannerProps) {
  const [mounted, setMounted] = useState(false);

  // Only render on client side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAccept = () => {
    // Enable all cookies
    if (typeof window !== "undefined") {
      // Initialize Google Analytics
      window.gtag?.("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }
  };

  const handleDecline = () => {
    // Only enable necessary cookies
    if (typeof window !== "undefined") {
      window.gtag?.("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    }
  };

  if (!mounted) return null;

  return (
    <CookieConsent
      enableDeclineButton
      onAccept={handleAccept}
      onDecline={handleDecline}
      buttonText="Acceptér alle cookies"
      declineButtonText="Kun nødvendige"
      cookieName="fysfinder-cookie-consent"
      expires={testMode ? 0.001 : 150}
      debug={testMode}
      disableStyles={true}
      containerClasses="fixed left-1/2 -translate-x-1/2 bottom-4 max-w-4xl w-full mx-auto bg-white rounded-lg shadow-xl p-4 text-sm flex flex-col sm:flex-row items-center gap-4 sm:items-center sm:justify-between sm:m-4"
      buttonWrapperClasses="flex items-center space-x-2 shrink-0"
      buttonClasses="whitespace-nowrap px-4 py-1.5 rounded-md bg-[#1894E0] text-white text-xs hover:bg-[#1576B3] transition-colors"
      declineButtonClasses="whitespace-nowrap px-4 py-1.5 rounded-md border border-[#1894E0] text-[#1894E0] text-xs hover:bg-gray-50 transition-colors"
    >
      <p className="text-gray-700 text-center sm:text-left">
        Vi bruger cookies for at give dig den bedste oplevelse.{" "}
        <a href="/privatlivspolitik" className="text-[#1894E0] hover:underline">
          Læs mere
        </a>
        .
        {testMode && (
          <span className="text-red-500 font-bold"> (Test Mode)</span>
        )}
      </p>
    </CookieConsent>
  );
}
