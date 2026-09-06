// Updated: 2026-09-06 - Covers granted/denied parsing of the consent cookie.

import { hasGrantedAnalyticsConsent } from "../cookie-consent";

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
