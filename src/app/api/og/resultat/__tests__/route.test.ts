/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "../[tool]/route";
import { renderToolShareImage } from "@/lib/og/tool-share-image";

jest.mock("@/lib/og/tool-share-image", () => ({
  renderToolShareImage: jest.fn(),
}));

const mockRender = renderToolShareImage as jest.MockedFunction<
  typeof renderToolShareImage
>;

function call(tool: string, query: string) {
  return GET(new NextRequest(`https://www.fysfinder.dk/api/og/resultat/${tool}?${query}`), {
    params: Promise.resolve({ tool }),
  });
}

describe("GET /api/og/resultat/[tool]", () => {
  beforeEach(() => {
    mockRender.mockReset().mockResolvedValue(new Response("png") as never);
  });

  it("renders the tool's card with a CDN cache header", async () => {
    const response = await call("bmi", "bmi=22.9");

    expect(response.status).toBe(200);
    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Mit BMI", value: "22,9", badge: "Normal vægt" }),
      expect.objectContaining({ "Cache-Control": expect.stringContaining("s-maxage") })
    );
  });

  it("rejects unknown tools and invalid values", async () => {
    expect((await call("ukendt", "bmi=22.9")).status).toBe(400);
    expect((await call("bmi", "bmi=nope")).status).toBe(400);
    expect(mockRender).not.toHaveBeenCalled();
  });
});
