import { getLocationOgContent } from "@/lib/og/location-og-content";
import { fetchLocationData } from "@/app/find/fysioterapeut/[location]/fetch-location-data";
import { buildFindPageSocialMetadata } from "@/lib/og/find-page-social-metadata";

jest.mock("@/app/find/fysioterapeut/[location]/fetch-location-data", () => ({
  fetchLocationData: jest.fn(),
}));

const mockFetchLocationData = fetchLocationData as jest.MockedFunction<
  typeof fetchLocationData
>;

function locationData(overrides: Record<string, unknown>) {
  return {
    city: null,
    clinics: [],
    nearbyClinicsList: [],
    nearbyCities: [],
    specialties: [
      { specialty_id: "1", specialty_name: "Knæ", specialty_name_slug: "knae" },
    ],
    ...overrides,
  } as unknown as Awaited<ReturnType<typeof fetchLocationData>>;
}

describe("getLocationOgContent", () => {
  beforeEach(() => mockFetchLocationData.mockReset());

  it("counts the clinics the page lists for the city and specialty", async () => {
    mockFetchLocationData.mockResolvedValue(
      locationData({
        city: { bynavn: "Frederiksberg", location_preposition: "i" },
        clinics: [{}, {}, {}],
      })
    );

    const content = await getLocationOgContent("frederiksberg", "knae");

    expect(mockFetchLocationData).toHaveBeenCalledWith("frederiksberg", "knae");
    expect(content.specialtyName).toBe("Knæ");
    expect(content.text.alt).toBe(
      "Sammenlign 3 fysioterapiklinikker i Frederiksberg med speciale i knæ"
    );
  });

  it("falls back to a branded image without a count for unknown locations", async () => {
    mockFetchLocationData.mockResolvedValue(locationData({}));

    const content = await getLocationOgContent("ukendt-by");

    expect(content.text.headline).toBe("Find fysioterapi nær Ukendt By");
    expect(content.text.headline).not.toMatch(/\d/);
  });

  it("names Danmark even though it has no city row", async () => {
    mockFetchLocationData.mockResolvedValue(
      locationData({ clinics: Array.from({ length: 1000 }, () => ({})) })
    );

    const content = await getLocationOgContent("danmark");

    expect(content.text.headline).toBe("Sammenlign 1000+ fysioterapiklinikker i Danmark");
  });
});

describe("buildFindPageSocialMetadata", () => {
  it("shares the page's own title instead of the generic site title", () => {
    const metadata = buildFindPageSocialMetadata("Ryg fysioterapi i Aarhus", "Beskrivelse");
    expect(metadata.openGraph).toMatchObject({
      title: "Ryg fysioterapi i Aarhus",
      description: "Beskrivelse",
      locale: "da_DK",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
