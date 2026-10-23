/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "../route";
import { renderMacroShareImage } from "@/lib/og/macro-share-image";

jest.mock("@/lib/og/macro-share-image", () => ({
  renderMacroShareImage: jest.fn(),
}));

const mockRender = renderMacroShareImage as jest.MockedFunction<
  typeof renderMacroShareImage
>;

function request(query: string) {
  return new NextRequest(`https://www.fysfinder.dk/api/og/makro?${query}`);
}

describe("GET /api/og/makro", () => {
  beforeEach(() => {
    mockRender.mockReset().mockResolvedValue(new Response("png") as never);
  });

  it("renders the macro card with a CDN cache header", async () => {
    const response = await GET(
      request("kcal=2643&protein=105-16&kulhydrat=358-54&fedt=88-30")
    );

    expect(response.status).toBe(200);
    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({
        kcalPerDay: 2643,
        macros: expect.objectContaining({ fat: { grams: 88, pct: 30 } }),
      }),
      expect.objectContaining({ "Cache-Control": expect.stringContaining("s-maxage") })
    );
  });

  it("rejects invalid macros", async () => {
    expect((await GET(request("kcal=2643&protein=nope"))).status).toBe(400);
    expect(mockRender).not.toHaveBeenCalled();
  });
});
