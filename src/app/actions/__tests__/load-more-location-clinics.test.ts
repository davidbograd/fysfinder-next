// Updated: 2026-09-06 - Guards slug/offset validation for location listing pagination.

import { loadMoreLocationClinics } from "@/app/actions/load-more-location-clinics";
import { fetchLocationData } from "@/app/find/fysioterapeut/[location]/fetch-location-data";

jest.mock("@/app/find/fysioterapeut/[location]/fetch-location-data", () => ({
  fetchLocationData: jest.fn(),
}));

const mockFetchLocationData = fetchLocationData as jest.MockedFunction<
  typeof fetchLocationData
>;

describe("loadMoreLocationClinics", () => {
  beforeEach(() => {
    mockFetchLocationData.mockReset();
  });

  it("returns the next page of clinics for a valid offset", async () => {
    mockFetchLocationData.mockResolvedValue({
      city: null,
      nearbyClinicsList: [],
      nearbyCities: [],
      specialties: [],
      clinics: Array.from({ length: 12 }, (_, index) => ({
        clinics_id: `clinic-${index + 1}`,
      })),
    } as Awaited<ReturnType<typeof fetchLocationData>>);

    const clinics = await loadMoreLocationClinics({
      locationSlug: "aarhus",
      specialtySlug: "ryg",
      offset: 10,
    });

    expect(mockFetchLocationData).toHaveBeenCalledWith("aarhus", "ryg", undefined);
    expect(clinics).toHaveLength(2);
    expect(clinics[0].clinics_id).toBe("clinic-11");
  });

  it("rejects invalid slugs and too-small offsets", async () => {
    await expect(
      loadMoreLocationClinics({ locationSlug: "Aarhus", offset: 10 })
    ).resolves.toEqual([]);
    await expect(
      loadMoreLocationClinics({ locationSlug: "aarhus", offset: 0 })
    ).resolves.toEqual([]);
    expect(mockFetchLocationData).not.toHaveBeenCalled();
  });
});
