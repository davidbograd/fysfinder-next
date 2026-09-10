// Updated: 2026-09-10 - Covers granted/denied cookie parsing and gtag consent updates.

import {
  applyGtagConsentUpdate,
  DENIED_ANALYTICS_CONSENT,
  GRANTED_ANALYTICS_CONSENT,
  hasDeclinedAnalyticsConsent,
  hasGrantedAnalyticsConsent,
} from "../cookie-consent";

describe("hasGrantedAnalyticsConsent", () => {
  it("returns true only for an accepted consent cookie", () => {
    expect(hasGrantedAnalyticsConsent("fysfinder-cookie-consent=true")).toBe(
      true
    );
    expect(
      hasGrantedAnalyticsConsent(
        "other=1; fysfinder-cookie-consent=true; theme=light"
      )
    ).toBe(true);
  });

  it("returns false when analytics were declined or missing", () => {
    expect(hasGrantedAnalyticsConsent("")).toBe(false);
    expect(hasGrantedAnalyticsConsent("fysfinder-cookie-consent=false")).toBe(
      false
    );
    expect(hasGrantedAnalyticsConsent("unrelated=true")).toBe(false);
  });
});

describe("hasDeclinedAnalyticsConsent", () => {
  it("returns true only for an explicit decline cookie", () => {
    expect(hasDeclinedAnalyticsConsent("fysfinder-cookie-consent=false")).toBe(
      true
    );
    expect(hasDeclinedAnalyticsConsent("")).toBe(false);
    expect(hasDeclinedAnalyticsConsent("fysfinder-cookie-consent=true")).toBe(
      false
    );
  });
});

describe("applyGtagConsentUpdate", () => {
  it("updates gtag consent to granted or denied", () => {
    const gtag = jest.fn();
    window.gtag = gtag;

    applyGtagConsentUpdate(true);
    expect(gtag).toHaveBeenCalledWith("consent", "update", GRANTED_ANALYTICS_CONSENT);

    applyGtagConsentUpdate(false);
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_ANALYTICS_CONSENT);

    delete window.gtag;
  });
});
