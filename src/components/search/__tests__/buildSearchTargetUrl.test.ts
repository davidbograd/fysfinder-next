// Added: 2026-03-30 - MVP coverage for search target URL derivation from state.
import {
  buildSearchTargetUrl,
  buildSearchTargetUrlFromState,
} from "../buildSearchTargetUrl";
import { SearchState } from "../SearchProvider";

describe("buildSearchTargetUrl", () => {
  it("uses selected location slug when present", () => {
    expect(
      buildSearchTargetUrl({
        locationSlug: "odense",
        specialtySlug: "ryg",
      })
    ).toBe("/find/fysioterapeut/odense/ryg");
  });

  it("falls back to danmark for specialty-only search", () => {
    expect(
      buildSearchTargetUrl({
        specialtySlug: "knae",
      })
    ).toBe("/find/fysioterapeut/danmark/knae");
  });

  it("falls back to danmark without location or specialty", () => {
    expect(buildSearchTargetUrl({})).toBe("/find/fysioterapeut/danmark");
  });
});

describe("buildSearchTargetUrlFromState", () => {
  it("builds canonical URL from provider state", () => {
    const state = {
      location: { name: "Aarhus", slug: "aarhus" },
      specialty: null,
      filters: { handicap: true, ydernummer: true },
      isLoading: false,
      showFilters: false,
      hasUnsearchedChanges: false,
      results: { clinics: [], totalCount: 0, hasMore: false },
      pagination: { currentPage: 1, pageSize: 20, totalPages: 0 },
    } as SearchState;

    expect(buildSearchTargetUrlFromState(state)).toBe(
      "/find/fysioterapeut/aarhus?handicap=true&ydernummer=true"
    );
  });
});
