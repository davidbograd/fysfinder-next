import Image from "../opengraph-image";
import { getDictionaryTerm } from "@/lib/dictionary";
import { renderBrandOgImage } from "@/lib/og/brand-og-image";
import { notFound } from "next/navigation";

jest.mock("@/lib/dictionary", () => ({ getDictionaryTerm: jest.fn() }));
jest.mock("@/lib/og/brand-og-image", () => ({ renderBrandOgImage: jest.fn() }));
jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const mockGetTerm = getDictionaryTerm as jest.Mock;
const mockRender = renderBrandOgImage as jest.Mock;

function render(term: string) {
  return Image({ params: Promise.resolve({ term }) });
}

describe("ordbog opengraph-image", () => {
  beforeEach(() => {
    mockGetTerm.mockReset();
    mockRender.mockReset().mockResolvedValue("image");
    (notFound as unknown as jest.Mock).mockClear();
  });

  it("shows the Ordbog label and the article title, large for short titles", async () => {
    mockGetTerm.mockResolvedValue({ title: "Achillessene" });

    await render("achillessene");

    expect(mockGetTerm).toHaveBeenCalledWith("achillessene");
    expect(mockRender).toHaveBeenCalledWith(
      { label: "Ordbog", lines: ["Achillessene"], fontSize: 72 },
      expect.anything()
    );
  });

  it("lets the CDN cache the image instead of re-rendering per request", async () => {
    mockGetTerm.mockResolvedValue({ title: "Achillessene" });

    await render("achillessene");

    expect(mockRender).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ "Cache-Control": expect.stringContaining("s-maxage") })
    );
  });

  it("drops a size for long titles", async () => {
    mockGetTerm.mockResolvedValue({
      title: "Forstuvet fod – førstehjælp og genoptræning",
    });

    await render("forstuvet-fod");

    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({ fontSize: 60 }),
      expect.anything()
    );
  });

  it("never reads a file path outside the ordbog folder", async () => {
    await expect(render("..%2F..%2Fpackage")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockGetTerm).not.toHaveBeenCalled();
  });

  it("returns 404 for unknown terms", async () => {
    mockGetTerm.mockRejectedValue(new Error("ENOENT"));

    await expect(render("findes-ikke")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockRender).not.toHaveBeenCalled();
  });
});
