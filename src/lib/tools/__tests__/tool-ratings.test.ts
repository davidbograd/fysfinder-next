import {
  MIN_REAL_RATINGS_FOR_UNSEEDED_TOOL,
  resolvePublishedToolRating,
} from "../tool-ratings";
import { tools } from "../registry";

describe("resolvePublishedToolRating", () => {
  it("publishes the exact pre-existing markup for a calculator with no real ratings", () => {
    // Guards the star display already earned in Google: with zero real ratings the
    // output must stay identical to the previously hard-coded values.
    expect(resolvePublishedToolRating("bmi-beregner")).toEqual({
      ratingValue: "4.8",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    });
  });

  it("keeps every calculator that had a rating on the same baseline", () => {
    const calculators = [
      "bmi-beregner",
      "kalorieberegner",
      "fedtprocent-beregner",
      "pace-beregner",
      "rm-beregner",
    ] as const;

    for (const slug of calculators) {
      expect(resolvePublishedToolRating(slug)).toMatchObject({
        ratingValue: "4.8",
        reviewCount: "150",
      });
    }
  });

  it("blends real ratings on top of the baseline", () => {
    const published = resolvePublishedToolRating("bmi-beregner", {
      ratingCount: 10,
      ratingSum: 50,
    });

    // (4.8 * 150 + 50) / 160 = 4.8125 -> 4.8
    expect(published).toMatchObject({ ratingValue: "4.8", reviewCount: "160" });
  });

  it("lets a run of low real ratings move the published average down", () => {
    const published = resolvePublishedToolRating("bmi-beregner", {
      ratingCount: 100,
      ratingSum: 100,
    });

    // (720 + 100) / 250 = 3.28
    expect(published).toMatchObject({ ratingValue: "3.3", reviewCount: "250" });
  });

  it("publishes nothing for a tool without a baseline until it earns enough ratings", () => {
    expect(
      resolvePublishedToolRating("mr-scanning", {
        ratingCount: MIN_REAL_RATINGS_FOR_UNSEEDED_TOOL - 1,
        ratingSum: 45,
      })
    ).toBeNull();
  });

  it("publishes only genuine numbers once a baseline-free tool qualifies", () => {
    const published = resolvePublishedToolRating("mr-scanning", {
      ratingCount: MIN_REAL_RATINGS_FOR_UNSEEDED_TOOL,
      ratingSum: 46,
    });

    expect(published).toEqual({
      ratingValue: "4.6",
      reviewCount: "10",
      bestRating: "5",
      worstRating: "1",
    });
  });

  it("never publishes a value outside the 1-5 scale", () => {
    const published = resolvePublishedToolRating("mr-scanning", {
      ratingCount: 10,
      ratingSum: 999,
    });

    expect(published?.ratingValue).toBe("5.0");
  });

  it("falls back to the baseline when stats are malformed", () => {
    expect(
      resolvePublishedToolRating("bmi-beregner", {
        ratingCount: Number.NaN,
        ratingSum: Number.NaN,
      })
    ).toMatchObject({ ratingValue: "4.8", reviewCount: "150" });
  });

  it("resolves a rating decision for every registered tool", () => {
    for (const tool of tools) {
      expect(() => resolvePublishedToolRating(tool.slug)).not.toThrow();
    }
  });
});
