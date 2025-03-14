import { processCities, CityWithCount, RegionData } from "../page";

const mockCities: CityWithCount[] = [
  {
    id: "1",
    bynavn: "København",
    bynavn_slug: "kobenhavn",
    postal_codes: ["1000", "1050", "1051"],
    clinic_count: 10,
  },
  {
    id: "2",
    bynavn: "Aarhus",
    bynavn_slug: "aarhus",
    postal_codes: ["8000"],
    clinic_count: 15,
  },
  {
    id: "3",
    bynavn: "Roskilde",
    bynavn_slug: "roskilde",
    postal_codes: ["4000"],
    clinic_count: 5,
  },
  {
    id: "4",
    bynavn: "Greve",
    bynavn_slug: "greve",
    postal_codes: ["2670", "4000"],
    clinic_count: 3,
  },
];

describe("processCities", () => {
  it("sorts cities into correct regions based on postal codes", () => {
    const result = processCities(mockCities);

    // Check if regions are created correctly
    expect(
      result.find((r: RegionData) => r.name === "Hovedstaden")
    ).toBeDefined();
    expect(
      result.find((r: RegionData) => r.name === "Midtjylland")
    ).toBeDefined();
    expect(result.find((r: RegionData) => r.name === "Sjælland")).toBeDefined();

    // Check if cities are in correct regions
    const hovedstaden = result.find(
      (r: RegionData) => r.name === "Hovedstaden"
    )!;
    expect(
      hovedstaden.cities.some((c: CityWithCount) => c.bynavn === "København")
    ).toBeTruthy();

    const midtjylland = result.find(
      (r: RegionData) => r.name === "Midtjylland"
    )!;
    expect(
      midtjylland.cities.some((c: CityWithCount) => c.bynavn === "Aarhus")
    ).toBeTruthy();
  });

  it("orders cities by clinic count (highest first)", () => {
    const result = processCities(mockCities);
    const hovedstaden = result.find(
      (r: RegionData) => r.name === "Hovedstaden"
    )!;

    expect(hovedstaden.cities[0].clinic_count).toBeGreaterThanOrEqual(
      hovedstaden.cities[hovedstaden.cities.length - 1].clinic_count
    );
  });

  it("handles empty city list", () => {
    const result = processCities([]);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((region: RegionData) => {
      expect(region.cities).toHaveLength(0);
    });
  });

  it("handles city with multiple postal codes in different regions", () => {
    const result = processCities(mockCities);

    const hovedstaden = result.find(
      (r: RegionData) => r.name === "Hovedstaden"
    )!;
    const sjaelland = result.find((r: RegionData) => r.name === "Sjælland")!;

    expect(
      hovedstaden.cities.some((c: CityWithCount) => c.bynavn === "Greve")
    ).toBeTruthy();
    expect(
      sjaelland.cities.some((c: CityWithCount) => c.bynavn === "Greve")
    ).toBeTruthy();
  });
});
