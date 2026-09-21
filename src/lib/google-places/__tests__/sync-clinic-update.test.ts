/**
 * Rules for the scheduled Google sync — in particular what it must refuse to overwrite.
 */

import {
  buildClinicSyncUpdate,
  isUnexpectedPlaceType,
  type ClinicSyncRow,
  type PlaceDetailsForSync,
} from "../sync-clinic-update";

const clinic = (overrides: Partial<ClinicSyncRow> = {}): ClinicSyncRow => ({
  clinics_id: "clinic-1",
  klinikNavn: "BeneFit Herning",
  google_place_id: "ChIJ8X7Ez_m7S0YRKnKyivNUm74",
  verified_klinik: false,
  avgRating: 4.5,
  ratingCount: 20,
  handicapadgang: null,
  tlf: "97 21 70 16",
  website: "https://www.benefit.dk/herning",
  google_maps_url_cid: null,
  google_business_status: null,
  opening_hours: null,
  mandag: null,
  tirsdag: null,
  onsdag: null,
  torsdag: null,
  fredag: null,
  lørdag: null,
  søndag: null,
  ...overrides,
});

const HERNING_PERIODS = [
  { open: { day: 1, hour: 8, minute: 0 }, close: { day: 1, hour: 18, minute: 0 } },
  { open: { day: 5, hour: 8, minute: 0 }, close: { day: 5, hour: 14, minute: 0 } },
];

describe("buildClinicSyncUpdate — opening hours", () => {
  it("writes both the structured column and the legacy columns", () => {
    const { updateData } = buildClinicSyncUpdate({
      clinic: clinic(),
      details: { regularOpeningHours: { periods: HERNING_PERIODS } },
    });

    expect(updateData.opening_hours).toEqual({
      mon: [{ open: "08:00", close: "18:00" }],
      tue: [],
      wed: [],
      thu: [],
      fri: [{ open: "08:00", close: "14:00" }],
      sat: [],
      sun: [],
    });
    expect(updateData.opening_hours_source).toBe("google");
    expect(updateData.mandag).toBe("08.00–18.00");
    expect(updateData.fredag).toBe("08.00–14.00");
    expect(updateData.lørdag).toBe("Lukket");
  });

  it("leaves hours untouched when Google has none (regression: wrote 'Lukket' everywhere)", () => {
    const { updateData, changeKinds } = buildClinicSyncUpdate({
      clinic: clinic({ mandag: "08:00 – 17:00" }),
      details: { rating: 4.5 },
    });

    expect(updateData).not.toHaveProperty("opening_hours");
    expect(updateData).not.toHaveProperty("mandag");
    expect(changeKinds).not.toContain("hours");
  });

  it("recovers a clinic previously wiped to 'Lukket' on every day", () => {
    const wiped = clinic({
      mandag: "Lukket",
      tirsdag: "Lukket",
      onsdag: "Lukket",
      torsdag: "Lukket",
      fredag: "Lukket",
      lørdag: "Lukket",
      søndag: "Lukket",
    });

    const { updateData, changeKinds } = buildClinicSyncUpdate({
      clinic: wiped,
      details: { regularOpeningHours: { periods: HERNING_PERIODS } },
    });

    expect(changeKinds).toContain("hours");
    expect(updateData.mandag).toBe("08.00–18.00");
  });

  it("flags rather than applies a closed-all-week result over real hours", () => {
    const { updateData, suspiciousClosedAllWeek } = buildClinicSyncUpdate({
      clinic: clinic({ mandag: "08:00 – 17:00", tirsdag: "08:00 – 17:00" }),
      details: {
        regularOpeningHours: {
          weekdayDescriptions: [
            "mandag: Lukket",
            "tirsdag: Lukket",
            "onsdag: Lukket",
            "torsdag: Lukket",
            "fredag: Lukket",
            "lørdag: Lukket",
            "søndag: Lukket",
          ],
        },
      },
    });

    expect(suspiciousClosedAllWeek).toBe(true);
    expect(updateData).not.toHaveProperty("opening_hours");
    expect(updateData).not.toHaveProperty("mandag");
  });

  it("does not rewrite hours that already match", () => {
    const synced = clinic({
      opening_hours: {
        mon: [{ open: "08:00", close: "18:00" }],
        tue: [],
        wed: [],
        thu: [],
        fri: [{ open: "08:00", close: "14:00" }],
        sat: [],
        sun: [],
      },
    });

    const { changeKinds } = buildClinicSyncUpdate({
      clinic: synced,
      details: { regularOpeningHours: { periods: HERNING_PERIODS } },
    });

    expect(changeKinds).not.toContain("hours");
  });
});

describe("buildClinicSyncUpdate — verified clinics", () => {
  const details: PlaceDetailsForSync = {
    rating: 4.9,
    userRatingCount: 120,
    googleMapsUri: "https://maps.google.com/?cid=1",
    regularOpeningHours: { periods: HERNING_PERIODS },
    nationalPhoneNumber: "11 22 33 44",
    websiteUri: "https://example.com",
    accessibilityOptions: { wheelchairAccessibleEntrance: true },
  };

  it("refreshes ratings and maps URL but never owner-managed fields", () => {
    const { updateData } = buildClinicSyncUpdate({
      clinic: clinic({ verified_klinik: true }),
      details,
    });

    expect(updateData.avgRating).toBe(4.9);
    expect(updateData.ratingCount).toBe(120);
    expect(updateData.google_maps_url_cid).toBe("https://maps.google.com/?cid=1");

    expect(updateData).not.toHaveProperty("opening_hours");
    expect(updateData).not.toHaveProperty("tlf");
    expect(updateData).not.toHaveProperty("website");
    expect(updateData).not.toHaveProperty("handicapadgang");
  });

  it("syncs everything for unclaimed clinics", () => {
    const { updateData } = buildClinicSyncUpdate({
      clinic: clinic(),
      details,
    });

    expect(updateData.tlf).toBe("11 22 33 44");
    expect(updateData.website).toBe("https://example.com");
    expect(updateData.handicapadgang).toBe(true);
  });
});

describe("buildClinicSyncUpdate — contact and accessibility", () => {
  it("prefers the national phone format the dashboard editor expects", () => {
    const { updateData } = buildClinicSyncUpdate({
      clinic: clinic({ tlf: "+45 97 21 70 16" }),
      details: {
        nationalPhoneNumber: "97 21 70 16",
        internationalPhoneNumber: "+45 97 21 70 16",
      },
    });

    expect(updateData.tlf).toBe("97 21 70 16");
  });

  it("falls back to the international number when no national one is returned", () => {
    const { updateData } = buildClinicSyncUpdate({
      clinic: clinic({ tlf: null }),
      details: { internationalPhoneNumber: "+45 97 21 70 16" },
    });

    expect(updateData.tlf).toBe("+45 97 21 70 16");
  });

  it("only fills wheelchair access when we have no value at all", () => {
    const fromGoogle = buildClinicSyncUpdate({
      clinic: clinic({ handicapadgang: null }),
      details: { accessibilityOptions: { wheelchairAccessibleEntrance: false } },
    });
    expect(fromGoogle.updateData.handicapadgang).toBe(false);

    const alreadySet = buildClinicSyncUpdate({
      clinic: clinic({ handicapadgang: true }),
      details: { accessibilityOptions: { wheelchairAccessibleEntrance: false } },
    });
    expect(alreadySet.updateData).not.toHaveProperty("handicapadgang");
  });
});

describe("buildClinicSyncUpdate — business status", () => {
  it("persists the status instead of only logging it", () => {
    const { updateData, changeKinds } = buildClinicSyncUpdate({
      clinic: clinic(),
      details: { businessStatus: "CLOSED_PERMANENTLY" },
    });

    expect(updateData.google_business_status).toBe("CLOSED_PERMANENTLY");
    expect(changeKinds).toContain("businessStatus");
  });
});

describe("isUnexpectedPlaceType", () => {
  it("accepts clinic-like places", () => {
    expect(
      isUnexpectedPlaceType({ types: ["physiotherapist", "establishment"] })
    ).toBe(false);
  });

  it("flags a Place ID that now points somewhere unrelated", () => {
    expect(isUnexpectedPlaceType({ types: ["restaurant", "food"] })).toBe(true);
  });

  it("stays quiet when Google returns no types", () => {
    expect(isUnexpectedPlaceType({})).toBe(false);
  });
});
