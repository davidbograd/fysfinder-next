/**
 * Tests Google approve-sync helpers, including shared Place IDs that must not move map pins.
 */

import {
  buildClinicGooglePlaceUpdate,
  isLikelyGoogleMapsUrl,
  parseOpeningHoursFromGoogleDescriptions,
} from "../approve-bootstrap-sync";

function clinicForSync(
  overrides: Partial<{
    adresse: string | null;
    postnummer: number | null;
    lokation: string | null;
    tlf: string | null;
    website: string | null;
  }> = {}
) {
  return {
    clinics_id: "clinic-1",
    klinikNavn: "Hjernerystelsesfyssen Aarhus",
    adresse: "Kirkedammen 29A",
    postnummer: 8000,
    lokation: "Aarhus C",
    mandag: "08.00-16.00",
    tirsdag: null,
    onsdag: null,
    torsdag: null,
    fredag: null,
    lørdag: null,
    søndag: null,
    tlf: "12345678",
    website: "https://example.com",
    ...overrides,
  };
}

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

describe("buildClinicGooglePlaceUpdate", () => {
  const sharedPlaceId = "ChIJjfDrqg1nUCQRBWAk7o9jCIo";
  const hqPlaceDetails = {
    rating: 4.8,
    userRatingCount: 120,
    googleMapsUri: "https://maps.google.com/?cid=9946309246874574853",
  };

  it("writes ratings and Place ID from a shared listing without using Place coordinates", () => {
    const update = buildClinicGooglePlaceUpdate({
      placeId: sharedPlaceId,
      details: hqPlaceDetails,
      clinic: clinicForSync(),
      addressCoordinates: {
        latitude: 56.14007208,
        longitude: 10.17768914,
      },
    });

    expect(update.google_place_id).toBe(sharedPlaceId);
    expect(update.avgRating).toBe(4.8);
    expect(update.ratingCount).toBe(120);
    expect(update.google_maps_url_cid).toBe(hqPlaceDetails.googleMapsUri);
    expect(update.latitude).toBe(56.14007208);
    expect(update.longitude).toBe(10.17768914);
  });

  it("gives two clinics with one Place ID two different map coordinates", () => {
    const aarhus = buildClinicGooglePlaceUpdate({
      placeId: sharedPlaceId,
      details: hqPlaceDetails,
      clinic: clinicForSync(),
      addressCoordinates: {
        latitude: 56.14007208,
        longitude: 10.17768914,
      },
    });
    const odense = buildClinicGooglePlaceUpdate({
      placeId: sharedPlaceId,
      details: hqPlaceDetails,
      clinic: clinicForSync({
        adresse: "Kratholmvej 49",
        postnummer: 5260,
        lokation: "Odense S",
      }),
      addressCoordinates: {
        latitude: 55.349,
        longitude: 10.367,
      },
    });

    expect(aarhus.google_place_id).toBe(odense.google_place_id);
    expect(aarhus.avgRating).toBe(odense.avgRating);
    expect(aarhus.latitude).not.toEqual(odense.latitude);
    expect(aarhus.longitude).not.toEqual(odense.longitude);
  });

  it("omits coordinates when the clinic address could not be geocoded", () => {
    const update = buildClinicGooglePlaceUpdate({
      placeId: sharedPlaceId,
      details: hqPlaceDetails,
      clinic: clinicForSync(),
      addressCoordinates: null,
    });

    expect(update.google_place_id).toBe(sharedPlaceId);
    expect(update).not.toHaveProperty("latitude");
    expect(update).not.toHaveProperty("longitude");
  });
});
