// Updated: 2026-03-30 - Mocked static Supabase client path used by city utilities.
import { fetchSpecialties, type Specialty } from "../utils/cityUtils";

// Mock Supabase client
jest.mock("@/app/utils/supabase/static", () => ({
  createStaticClient: () => ({
    from: () => ({
      select: () => ({
        data: [
          {
            specialty_id: "1",
            specialty_name: "Sportsfysioterapi",
            specialty_name_slug: "sportsfysioterapi",
          },
          {
            specialty_id: "2",
            specialty_name: "Børnefysioterapi",
            specialty_name_slug: "bornefysioterapi",
          },
        ],
        error: null,
      }),
    }),
  }),
}));

describe("fetchSpecialties", () => {
  it("returns list of specialties with correct structure", async () => {
    const specialties = await fetchSpecialties();
    expect(specialties).toHaveLength(2);
    expect(specialties[0]).toEqual({
      specialty_id: "1",
      specialty_name: "Sportsfysioterapi",
      specialty_name_slug: "sportsfysioterapi",
    });
  });

  it("handles empty result", async () => {
    // Override mock for this test
    jest
      .spyOn(require("@/app/utils/supabase/static"), "createStaticClient")
      .mockImplementationOnce(() => ({
        from: () => ({
          select: () => ({
            data: [],
            error: null,
          }),
        }),
      }));

    const specialties = await fetchSpecialties();
    expect(specialties).toHaveLength(0);
  });

  it("handles database error", async () => {
    // Override mock for this test
    jest
      .spyOn(require("@/app/utils/supabase/static"), "createStaticClient")
      .mockImplementationOnce(() => ({
        from: () => ({
          select: () => ({
            data: null,
            error: new Error("Database error"),
          }),
        }),
      }));

    await expect(fetchSpecialties()).rejects.toThrow(
      "Failed to fetch specialties"
    );
  });
});
