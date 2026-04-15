import { buildPremiumLocationCityIds } from "@/lib/stripe/premium-locations";

describe("buildPremiumLocationCityIds", () => {
  it("always preserves home city even if owner only selects neighbors", () => {
    const result = buildPremiumLocationCityIds({
      homeCityId: "home-city",
      selectedCityIds: ["neighbor-1", "neighbor-2"],
      allowedCityIds: new Set(["home-city", "neighbor-1", "neighbor-2"]),
    });

    expect(result).toEqual(["home-city", "neighbor-1", "neighbor-2"]);
  });

  it("filters duplicates/disallowed cities and enforces max two neighbors", () => {
    const result = buildPremiumLocationCityIds({
      homeCityId: "home-city",
      selectedCityIds: [
        "neighbor-1",
        "neighbor-1",
        "home-city",
        "neighbor-3",
        "neighbor-2",
        "disallowed-city",
      ],
      allowedCityIds: new Set(["home-city", "neighbor-1", "neighbor-2", "neighbor-3"]),
    });

    expect(result).toEqual(["home-city", "neighbor-1", "neighbor-3"]);
  });

  it("falls back to allowed neighbors when home city is missing", () => {
    const result = buildPremiumLocationCityIds({
      homeCityId: null,
      selectedCityIds: ["neighbor-1", "neighbor-2", "neighbor-3"],
      allowedCityIds: new Set(["neighbor-1", "neighbor-2", "neighbor-3"]),
    });

    expect(result).toEqual(["neighbor-1", "neighbor-2"]);
  });
});
