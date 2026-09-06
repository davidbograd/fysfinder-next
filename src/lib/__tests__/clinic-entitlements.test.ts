// Tests for shared clinic entitlement and ranking policies.
// Updated: verifies free vs premium sort order, nearby-city access, and team-member availability.

import {
  canAccessNearbyCityRanking,
  canAccessTeamMembersFeature,
  getPrimaryRankingContext,
  getRankingPolicy,
  getWeightedRatingScore,
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

  test("a handful of perfect reviews does not outrank a well-reviewed clinic", () => {
    // Regression: ranking on the raw average put a single 5-star review above a clinic
    // with 100 reviews at 4.9, so the top of every location page was the least-proven
    // clinic. Scores are shrunk toward the corpus average by review count instead.
    const clinics = [
      { id: "one-perfect-review", avgRating: 5, ratingCount: 1 },
      { id: "five-perfect-reviews", avgRating: 5, ratingCount: 5 },
      { id: "hundred-reviews-4-9", avgRating: 4.9, ratingCount: 100 },
    ];

    const sorted = sortClinicsByPolicy(clinics, getRankingPolicy("danmark"));

    expect(sorted.map((clinic) => clinic.id)).toEqual([
      "hundred-reviews-4-9",
      "five-perfect-reviews",
      "one-perfect-review",
    ]);
  });

  test("enough perfect reviews still beats a slightly lower rating", () => {
    // The weighting must not collapse into ranking by review count: a clinic with a
    // convincing number of 5-star reviews should still lead a larger 4.5-rated one.
    const clinics = [
      { id: "many-reviews-4-5", avgRating: 4.5, ratingCount: 300 },
      { id: "forty-perfect-reviews", avgRating: 5, ratingCount: 40 },
    ];

    const sorted = sortClinicsByPolicy(clinics, getRankingPolicy("danmark"));
    expect(sorted[0].id).toBe("forty-perfect-reviews");
  });

  test("unrated clinics rank below every rated clinic", () => {
    // The prior mean is only a pull toward the average, never a score of its own — a
    // clinic with no reviews must not land mid-table above rated competitors.
    const clinics = [
      { id: "unrated", avgRating: null, ratingCount: null },
      { id: "mediocre-but-rated", avgRating: 3.2, ratingCount: 40 },
      { id: "zero-count", avgRating: 4.9, ratingCount: 0 },
    ];

    const sorted = sortClinicsByPolicy(clinics, getRankingPolicy("danmark"));
    expect(sorted[0].id).toBe("mediocre-but-rated");
    expect(sorted.map((clinic) => clinic.id).slice(1).sort()).toEqual([
      "unrated",
      "zero-count",
    ]);
  });

  test("weighted score handles the string numerics the nearby RPC returns", () => {
    // get_nearby_clinics serializes avgRating/ratingCount as strings; before the weighting
    // they were compared with `-`, which coerced silently. The score must not read NaN.
    expect(getWeightedRatingScore("4.9", "100")).toBeCloseTo(4.882, 3);
    expect(getWeightedRatingScore("5", "1")).toBeCloseTo(4.727, 3);
    expect(getWeightedRatingScore(null, null)).toBeNull();
    expect(getWeightedRatingScore("ikke et tal", "10")).toBeNull();

    const sorted = sortClinicsByPolicy(
      [
        { id: "one-perfect-review", avgRating: "5", ratingCount: "1" },
        { id: "hundred-reviews-4-9", avgRating: "4.9", ratingCount: "100" },
      ] as unknown as Array<{
        id: string;
        avgRating: number | null;
        ratingCount: number | null;
      }>,
      getRankingPolicy("danmark")
    );
    expect(sorted[0].id).toBe("hundred-reviews-4-9");
  });

  test("premium placement still outranks the weighted score", () => {
    // Weighting changes how clinics compare on reviews only; it must not demote a paying
    // clinic below a better-reviewed free one on the contexts premium is sold for.
    const clinics = [
      {
        id: "free-well-reviewed",
        avgRating: 4.9,
        ratingCount: 200,
        premium_listing: null,
        verified_klinik: false,
      },
      {
        id: "premium-few-reviews",
        avgRating: 4.2,
        ratingCount: 3,
        premium_listing: {
          start_date: "2025-01-01T00:00:00.000Z",
          end_date: "2999-01-01T00:00:00.000Z",
        },
        verified_klinik: false,
      },
    ];

    const sorted = sortClinicsByPolicy(clinics, getRankingPolicy("city"));
    expect(sorted[0].id).toBe("premium-few-reviews");
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
