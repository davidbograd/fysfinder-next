import {
  isLikelyGoogleMapsUrl,
  parseOpeningHoursFromGoogleDescriptions,
} from "../approve-bootstrap-sync";

describe("parseOpeningHoursFromGoogleDescriptions", () => {
  it("maps English weekday labels from Google Places API", () => {
    const lines = [
      "Monday: 7:00 AM – 9:00 PM",
      "Tuesday: 7:00 AM – 9:00 PM",
      "Wednesday: 7:00 AM – 9:00 PM",
      "Thursday: 7:00 AM – 9:00 PM",
      "Friday: 7:00 AM – 6:00 PM",
      "Saturday: 9:00 AM – 5:00 PM",
      "Sunday: 9:00 AM – 5:00 PM",
    ];
    const h = parseOpeningHoursFromGoogleDescriptions(lines);
    expect(h.mandag).toContain("7:00 AM");
    expect(h.fredag).toContain("6:00 PM");
    expect(h.søndag).toContain("9:00 AM");
    expect(h.mandag).not.toBe("Lukket");
  });

  it("maps Danish weekday labels", () => {
    const lines = [
      "mandag: 07.00–19.00",
      "tirsdag: 07.00–19.00",
      "onsdag: Lukket",
    ];
    const h = parseOpeningHoursFromGoogleDescriptions(lines);
    expect(h.mandag).toBe("07.00–19.00");
    expect(h.tirsdag).toBe("07.00–19.00");
    expect(h.onsdag).toBe("Lukket");
  });
});

describe("isLikelyGoogleMapsUrl", () => {
  it("accepts maps.app.goo.gl short links", () => {
    expect(isLikelyGoogleMapsUrl("https://maps.app.goo.gl/abc123")).toBe(true);
  });

  it("accepts full google.com/maps place URLs", () => {
    expect(
      isLikelyGoogleMapsUrl(
        "https://www.google.com/maps/place/Foo/@55.6,12.5,17z/data=!3m1!4b1"
      )
    ).toBe(true);
  });

  it("rejects non-Google hosts", () => {
    expect(isLikelyGoogleMapsUrl("https://evil.com/maps/place/foo")).toBe(false);
  });

  it("rejects google.com without /maps path", () => {
    expect(isLikelyGoogleMapsUrl("https://www.google.com/search?q=maps")).toBe(false);
  });
});
