// Tests for shared clinic entitlement and ranking policies.
// Updated: verifies free vs premium sort order, nearby-city access, and team-member availability.

import {
  canAccessNearbyCityRanking,
  canAccessTeamMembersFeature,
  getPrimaryRankingContext,
  getRankingPolicy,
  isPremiumListingActive,
  resolvePremiumListing,
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

  test("danmark-specialty policy ranks premium first even without any reviews", () => {
    // Regression: a premium clinic with no Google rating yet sorted last on
    // /find/fysioterapeut/danmark/<specialty>, because the page fell back to the
    // unfiltered danmark policy and `avgRating || 0` scored it zero.
    const clinics = [
      {
        id: "non-premium-rated",
        avgRating: 5,
        ratingCount: 90,
        premium_listing: null,
        verified_klinik: false,
      },
      {
        id: "premium-unrated",
        avgRating: null,
        ratingCount: null,
        premium_listing: {
          start_date: "2025-01-01T00:00:00.000Z",
          end_date: "2999-01-01T00:00:00.000Z",
        },
        verified_klinik: true,
      },
    ];

    const sorted = sortClinicsByPolicy(
      clinics,
      getRankingPolicy(getPrimaryRankingContext("danmark", "fibromyalgi"))
    );
    expect(sorted[0].id).toBe("premium-unrated");
  });

  test("ranking context maps location and specialty slugs", () => {
    expect(getPrimaryRankingContext("danmark")).toBe("danmark");
    expect(getPrimaryRankingContext("danmark", "fibromyalgi")).toBe(
      "danmark-specialty"
    );
    expect(getPrimaryRankingContext("online", "fibromyalgi")).toBe("online");
    expect(getPrimaryRankingContext("aarhus")).toBe("city");
    expect(getPrimaryRankingContext("aarhus", "fibromyalgi")).toBe(
      "city-specialty"
    );
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

  test("premium listing resolution prefers the active listing over array order", () => {
    // Regression: a clinic that renewed holds an expired listing and an active one, and
    // the database returned the expired one first. Taking [0] marked a paying clinic as
    // non-premium, dropping it out of premium ranking on cities it still pays for.
    const expired = {
      id: "expired",
      start_date: "2025-04-03T00:00:00.000Z",
      end_date: "2025-08-16T00:00:00.000Z",
    };
    const active = {
      id: "active",
      start_date: "2025-08-16T00:00:00.000Z",
      end_date: "2999-01-01T00:00:00.000Z",
    };

    expect(resolvePremiumListing([expired, active])?.id).toBe("active");
    expect(resolvePremiumListing([active, expired])?.id).toBe("active");
    expect(isPremiumListingActive(resolvePremiumListing([expired, active]))).toBe(
      true
    );
  });

  test("premium listing resolution handles empty and fully expired sets", () => {
    const expired = {
      id: "expired",
      start_date: "2025-04-03T00:00:00.000Z",
      end_date: "2025-08-16T00:00:00.000Z",
    };

    expect(resolvePremiumListing([])).toBeNull();
    expect(resolvePremiumListing(null)).toBeNull();
    expect(resolvePremiumListing(undefined)).toBeNull();
    // No active listing, so the clinic must not read as premium anywhere.
    expect(isPremiumListingActive(resolvePremiumListing([expired]))).toBe(false);
  });

  test("only clinics with an active listing survive the city premium filter", () => {
    // The premium query scopes premium_listings to one city in SQL, then the page keeps a
    // clinic only if what is left is active. These are the two real shapes that broke:
    // a clinic whose premium period ended, and one that renewed into a new listing.
    const endedLastYear = {
      start_date: "2025-04-03T00:00:00.000Z",
      end_date: "2025-07-03T00:00:00.000Z",
    };
    const renewal = {
      start_date: "2025-08-16T00:00:00.000Z",
      end_date: "2999-01-01T00:00:00.000Z",
    };

    const belongsOnCityPage = (listings: typeof endedLastYear[]) =>
      isPremiumListingActive(resolvePremiumListing(listings));

    // Lapsed clinic, still linked to a city it used to pay for.
    expect(belongsOnCityPage([endedLastYear])).toBe(false);
    // Renewed clinic whose old listing also covered this city and sorts first.
    expect(belongsOnCityPage([endedLastYear, renewal])).toBe(true);
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
