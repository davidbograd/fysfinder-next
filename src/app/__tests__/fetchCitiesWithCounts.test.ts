import { fetchCitiesWithCounts } from "../page";

// Mock Supabase client
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        data: [
          {
            id: "1",
            bynavn: "København",
            bynavn_slug: "kobenhavn",
            postal_codes: ["1000", "1050"],
            clinics: [{ count: 42 }],
          },
          {
            id: "2",
            bynavn: "Aarhus",
            bynavn_slug: "aarhus",
            postal_codes: ["8000"],
            clinics: [{ count: 25 }],
          },
          {
            id: "3",
            bynavn: "Odense",
            bynavn_slug: "odense",
            postal_codes: ["5000"],
            clinics: null,
          },
        ],
        error: null,
      }),
    }),
  }),
}));

describe("fetchCitiesWithCounts", () => {
  it("returns cities with their clinic counts", async () => {
    const cities = await fetchCitiesWithCounts();
    expect(cities).toHaveLength(3);
    expect(cities[0].clinic_count).toBe(42);
  });

  it("formats response correctly", async () => {
    const cities = await fetchCitiesWithCounts();
    expect(cities[0]).toEqual({
      id: "1",
      bynavn: "København",
      bynavn_slug: "kobenhavn",
      postal_codes: ["1000", "1050"],
      clinic_count: 42,
    });
  });

  it("handles clinic count being null/undefined", async () => {
    const cities = await fetchCitiesWithCounts();
    const cityWithNullClinics = cities.find((c) => c.bynavn === "Odense");
    expect(cityWithNullClinics?.clinic_count).toBe(0);
  });

  it("handles empty result from database", async () => {
    // Override mock for this test
    jest
      .spyOn(require("@/app/utils/supabase/server"), "createClient")
      .mockImplementationOnce(() => ({
        from: () => ({
          select: () => ({
            data: [],
            error: null,
          }),
        }),
      }));

    const cities = await fetchCitiesWithCounts();
    expect(cities).toHaveLength(0);
  });
});
