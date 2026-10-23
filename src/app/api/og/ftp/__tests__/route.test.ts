/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET as getFtp } from "../route";
import { GET as getWattPerKg } from "../../watt-pr-kg/route";
import {
  renderFtpShareImage,
  renderWattPerKgShareImage,
} from "@/lib/og/cycling-share-image";

jest.mock("@/lib/og/cycling-share-image", () => ({
  renderFtpShareImage: jest.fn(),
  renderWattPerKgShareImage: jest.fn(),
}));

const mockFtp = renderFtpShareImage as jest.MockedFunction<typeof renderFtpShareImage>;
const mockWkg = renderWattPerKgShareImage as jest.MockedFunction<
  typeof renderWattPerKgShareImage
>;

function request(path: string) {
  return new NextRequest(`https://www.fysfinder.dk${path}`);
}

describe("GET /api/og/ftp and /api/og/watt-pr-kg", () => {
  beforeEach(() => {
    mockFtp.mockReset().mockResolvedValue(new Response("png") as never);
    mockWkg.mockReset().mockResolvedValue(new Response("png") as never);
  });

  it("renders the FTP card with a CDN cache header", async () => {
    const response = await getFtp(request("/api/og/ftp?ftp=250&test=ramp"));

    expect(response.status).toBe(200);
    expect(mockFtp).toHaveBeenCalledWith(
      expect.objectContaining({ ftp: 250, source: "ramp" }),
      expect.objectContaining({ "Cache-Control": expect.stringContaining("s-maxage") })
    );
  });

  it("renders the watt per kg card with the level", async () => {
    const response = await getWattPerKg(request("/api/og/watt-pr-kg?wkg=4.1&koen=female"));

    expect(response.status).toBe(200);
    expect(mockWkg).toHaveBeenCalledWith(
      expect.objectContaining({ wattsPerKg: 4.1, level: "Fremragende" }),
      expect.anything()
    );
  });

  it("rejects invalid values", async () => {
    expect((await getFtp(request("/api/og/ftp?ftp=nope&test=ramp"))).status).toBe(400);
    expect((await getWattPerKg(request("/api/og/watt-pr-kg?wkg=3"))).status).toBe(400);
    expect(mockFtp).not.toHaveBeenCalled();
    expect(mockWkg).not.toHaveBeenCalled();
  });
});
