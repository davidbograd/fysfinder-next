import {
  DEFAULT_OG_IMAGE,
  getLocationOgText,
  hasGeneratedOgImage,
  resolveFindOgImage,
} from "@/lib/og/location-og-content";
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

describe("getLocationOgText", () => {
  beforeEach(() => mockFetchLocationData.mockReset());

  it("counts the clinics the page lists for the city and specialty", async () => {
    mockFetchLocationData.mockResolvedValue(
      locationData({
        city: { bynavn: "Frederiksberg", location_preposition: "i" },
        clinics: [{}, {}, {}],
      })
    );

    const text = await getLocationOgText("frederiksberg", "knae");

    expect(mockFetchLocationData).toHaveBeenCalledWith("frederiksberg", "knae", undefined);
    expect(text.alt).toBe(
      "Sammenlign 3 fysioterapiklinikker i Frederiksberg med speciale i knæ"
    );
  });

  it("fetches and describes the filtered listing on filtered pages", async () => {
    mockFetchLocationData.mockResolvedValue(
      locationData({ clinics: Array.from({ length: 243 }, () => ({})) })
    );

    const text = await getLocationOgText("danmark", undefined, { ydernummer: true });

    expect(mockFetchLocationData).toHaveBeenCalledWith("danmark", undefined, {
      ydernummer: true,
    });
    expect(text.headline).toBe("Sammenlign 243 fysioterapiklinikker med ydernummer i Danmark");
  });

  it("falls back to a count-free headline for unknown locations", async () => {
    mockFetchLocationData.mockResolvedValue(locationData({}));

    const text = await getLocationOgText("ukendt-by");

    expect(text.headline).toBe("Find fysioterapi nær Ukendt By");
  });
});

describe("resolveFindOgImage", () => {
  const data = locationData({
    city: { bynavn: "Aarhus C", location_preposition: "i" },
    clinics: [{}, {}],
  });

  it("generates images for city and city + specialty pages", () => {
    expect(resolveFindOgImage(data, "aarhus-c")).toEqual({
      url: "/api/og/find?location=aarhus-c",
      alt: "Sammenlign 2 fysioterapiklinikker i Aarhus C",
    });
    expect(resolveFindOgImage(data, "aarhus-c", "knae").url).toBe(
      "/api/og/find?location=aarhus-c&specialty=knae"
    );
  });

  it("generates images for the Danmark online and ydernummer pages", () => {
    expect(resolveFindOgImage(data, "danmark", undefined, { online: true }).url).toBe(
      "/api/og/find?location=danmark&online=true"
    );
    expect(resolveFindOgImage(data, "danmark", undefined, { ydernummer: true }).url).toBe(
      "/api/og/find?location=danmark&ydernummer=true"
    );
  });

  it("uses the site-wide image for every other filter combination", () => {
    for (const [location, specialty, filters] of [
      ["aarhus-c", undefined, { ydernummer: true }],
      ["danmark", undefined, { handicap: true }],
      ["danmark", undefined, { online: true, ydernummer: true }],
      ["danmark", "knae", { online: true }],
    ] as const) {
      expect(resolveFindOgImage(data, location, specialty, filters)).toBe(DEFAULT_OG_IMAGE);
      expect(hasGeneratedOgImage(location, specialty, filters)).toBe(false);
    }
  });
});

describe("buildFindPageSocialMetadata", () => {
  it("shares the page's own title and generated image", () => {
    const metadata = buildFindPageSocialMetadata("Ryg fysioterapi i Aarhus", "Beskrivelse", {
      url: "/api/og/find?location=aarhus-c",
      alt: "Sammenlign 13 fysioterapiklinikker i Aarhus C",
    });
    expect(metadata.openGraph).toMatchObject({
      title: "Ryg fysioterapi i Aarhus",
      description: "Beskrivelse",
      locale: "da_DK",
      images: [
        expect.objectContaining({
          url: "/api/og/find?location=aarhus-c",
          alt: "Sammenlign 13 fysioterapiklinikker i Aarhus C",
          width: 1200,
          height: 630,
        }),
      ],
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
