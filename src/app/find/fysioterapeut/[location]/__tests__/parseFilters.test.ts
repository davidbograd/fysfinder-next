// Added: 2026-03-30 - MVP unit coverage for location-page filter parsing.
import { parseFilters } from "../../filter-utils";

describe("parseFilters", () => {
  it("maps true query params to enabled filters", () => {
    expect(parseFilters({ ydernummer: "true", handicap: "true" })).toEqual({
      ydernummer: true,
      handicap: true,
    });
  });

  it("ignores missing and non-true values", () => {
    expect(parseFilters({ ydernummer: "false" })).toEqual({});
    expect(parseFilters(undefined)).toEqual({});
  });
});
