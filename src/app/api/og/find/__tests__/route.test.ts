/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "../route";
import { getLocationOgText } from "@/lib/og/location-og-content";
import { renderLocationOgImage } from "@/lib/og/location-og-image";

jest.mock("@/lib/og/location-og-content", () => ({
  ...jest.requireActual("@/lib/og/location-og-content"),
  getLocationOgText: jest.fn(),
}));
jest.mock("@/lib/og/location-og-image", () => ({
  renderLocationOgImage: jest.fn(),
}));

const mockGetText = getLocationOgText as jest.MockedFunction<typeof getLocationOgText>;
const mockRender = renderLocationOgImage as jest.MockedFunction<
  typeof renderLocationOgImage
>;

function request(query: string) {
  return new NextRequest(`https://www.fysfinder.dk/api/og/find?${query}`);
}

describe("GET /api/og/find", () => {
  beforeEach(() => {
    mockGetText.mockReset().mockResolvedValue({
      headline: "Sammenlign 152 fysioterapiklinikker med online behandling",
      specialtyLine: null,
      alt: "Sammenlign 152 fysioterapiklinikker med online behandling",
    });
    mockRender.mockReset().mockResolvedValue(new Response("png") as never);
  });

  it("renders the city + specialty image", async () => {
    const response = await GET(request("location=aarhus-c&specialty=knae"));

    expect(response.status).toBe(200);
    expect(mockGetText).toHaveBeenCalledWith("aarhus-c", "knae", {});
  });

  it("renders the Danmark online image with the filter applied", async () => {
    const response = await GET(request("location=danmark&online=true"));

    expect(response.status).toBe(200);
    expect(mockGetText).toHaveBeenCalledWith("danmark", undefined, { online: true });
    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({ headline: expect.stringContaining("152") }),
      expect.objectContaining({ "Cache-Control": expect.stringContaining("s-maxage") })
    );
  });

  it("rejects slugs that could alter the Supabase query", async () => {
    const response = await GET(request("location=danmark%26ydernummer%3Deq.true"));

    expect(response.status).toBe(400);
    expect(mockGetText).not.toHaveBeenCalled();
  });

  it("does not render filter combinations outside the supported pages", async () => {
    const response = await GET(request("location=aarhus-c&ydernummer=true"));

    expect(response.status).toBe(404);
    expect(mockGetText).not.toHaveBeenCalled();
  });

  it("requires a location", async () => {
    expect((await GET(request("specialty=knae"))).status).toBe(400);
  });
});
