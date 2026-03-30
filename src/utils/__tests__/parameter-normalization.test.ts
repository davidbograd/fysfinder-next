// Added: 2026-03-30 - MVP coverage for canonical search URL normalization behavior.
import {
  buildCanonicalUrl,
  buildSearchUrl,
  normalizeSearchParams,
  parseFiltersFromURL,
} from "../parameter-normalization";

describe("parameter-normalization", () => {
  it("normalizes filters to canonical parameter order", () => {
    const params = new URLSearchParams("ydernummer=true&handicap=true");
    expect(normalizeSearchParams(params)).toBe("handicap=true&ydernummer=true");
  });

  it("builds search URL with canonical filters", () => {
    const url = buildSearchUrl("aarhus", "ryg", {
      ydernummer: true,
      handicap: true,
    });
    expect(url).toBe("/find/fysioterapeut/aarhus/ryg?handicap=true&ydernummer=true");
  });

  it("omits false filters from canonical URL", () => {
    const url = buildCanonicalUrl("/find/fysioterapeut/danmark", {
      handicap: false,
      ydernummer: true,
    });
    expect(url).toBe("/find/fysioterapeut/danmark?ydernummer=true");
  });

  it("parses only true filter params from URL", () => {
    const filters = parseFiltersFromURL(
      new URLSearchParams("handicap=true&ydernummer=false")
    );
    expect(filters).toEqual({ handicap: true });
  });
});
