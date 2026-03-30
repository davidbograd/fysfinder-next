// Tests for shared clinic entitlement and ranking policies.
// Updated: verifies free vs premium sort order, nearby-city access, and team-member availability.

import {
  canAccessNearbyCityRanking,
  canAccessTeamMembersFeature,
  getRankingPolicy,
  sortClinicsByPolicy,
} from "@/lib/clinic-entitlements";

describe("clinic entitlement policies", () => {
  test("city policy ranks premium first, then verified clinics, then rating", () => {
    const clinics = [
      {
        id: "unverified-high-rating",
        avgRating: 5,
        ratingCount: 50,
        premium_listing: null,
        verified_klinik: false,
      },
      {
        id: "verified-mid-rating",
        avgRating: 4.2,
        ratingCount: 20,
        premium_listing: null,
        verified_klinik: true,
      },
      {
        id: "premium-low-rating",
        avgRating: 3.1,
        ratingCount: 5,
        premium_listing: {
          start_date: "2025-01-01T00:00:00.000Z",
          end_date: "2999-01-01T00:00:00.000Z",
        },
        verified_klinik: false,
      },
    ];

    const sorted = sortClinicsByPolicy(clinics, getRankingPolicy("city"));

    expect(sorted.map((clinic) => clinic.id)).toEqual([
      "premium-low-rating",
      "verified-mid-rating",
      "unverified-high-rating",
    ]);
  });

  test("city-specialty policy still ranks verified above unverified", () => {
    const clinics = [
      {
        id: "unverified",
        avgRating: 4.8,
        ratingCount: 100,
        premium_listing: null,
        verified_klinik: false,
      },
      {
        id: "verified",
        avgRating: 4.0,
        ratingCount: 10,
        premium_listing: null,
        verified_klinik: true,
      },
    ];

    const sorted = sortClinicsByPolicy(clinics, getRankingPolicy("city-specialty"));
    expect(sorted[0].id).toBe("verified");
  });

  test("danmark policy ignores premium and verified priority", () => {
    const clinics = [
      {
        id: "premium-lower-rating",
        avgRating: 4.0,
        ratingCount: 30,
        premium_listing: {
          start_date: "2025-01-01T00:00:00.000Z",
          end_date: "2999-01-01T00:00:00.000Z",
        },
        verified_klinik: true,
      },
      {
        id: "non-premium-higher-rating",
        avgRating: 4.8,
        ratingCount: 100,
        premium_listing: null,
        verified_klinik: false,
      },
    ];

    const sorted = sortClinicsByPolicy(clinics, getRankingPolicy("danmark"));
    expect(sorted[0].id).toBe("non-premium-higher-rating");
  });

  test("online policy keeps premium ordering behavior", () => {
    const clinics = [
      {
        id: "non-premium-higher-rating",
        avgRating: 5,
        ratingCount: 60,
        premium_listing: null,
        verified_klinik: false,
      },
      {
        id: "premium-lower-rating",
        avgRating: 3.5,
        ratingCount: 10,
        premium_listing: {
          start_date: "2025-01-01T00:00:00.000Z",
          end_date: "2999-01-01T00:00:00.000Z",
        },
        verified_klinik: false,
      },
    ];

    const sorted = sortClinicsByPolicy(clinics, getRankingPolicy("online"));
    expect(sorted[0].id).toBe("premium-lower-rating");
  });

  test("nearby-city ranking access is premium-only", () => {
    expect(
      canAccessNearbyCityRanking({
        premium_listings: [],
      })
    ).toBe(false);

    expect(
      canAccessNearbyCityRanking({
        premium_listings: [
          {
            start_date: "2025-01-01T00:00:00.000Z",
            end_date: "2999-01-01T00:00:00.000Z",
          },
        ],
      })
    ).toBe(true);
  });

  test("team members feature stays available for free users", () => {
    expect(canAccessTeamMembersFeature()).toBe(true);
  });
});
