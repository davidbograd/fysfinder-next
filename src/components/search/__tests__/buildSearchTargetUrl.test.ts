// Added: 2026-03-30 - MVP coverage for search target URL derivation from state.
import { buildSearchTargetUrl } from "../buildSearchTargetUrl";

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

  it("keeps active filters on the canonical URL", () => {
    expect(
      buildSearchTargetUrl({
        locationSlug: "aarhus",
        filters: { handicap: true, online: true, ydernummer: true },
      })
    ).toBe(
      "/find/fysioterapeut/aarhus?handicap=true&online=true&ydernummer=true"
    );
  });
});
