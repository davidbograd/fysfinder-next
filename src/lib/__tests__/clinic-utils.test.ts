// Tests for shared clinic helpers.

import { orderSpecialties } from "../clinic-utils";

const ryg = { specialty_name_slug: "ryg" };
const nakke = { specialty_name_slug: "nakke" };

describe("orderSpecialties", () => {
  it("moves the current specialty to the front", () => {
    expect(orderSpecialties([ryg, nakke], "nakke")).toEqual([nakke, ryg]);
  });

  it("leaves the order alone when no specialty is selected", () => {
    expect(orderSpecialties([ryg, nakke])).toEqual([ryg, nakke]);
  });

  it("returns an array for clinics that have no specialties", () => {
    // Regression: get_nearby_clinics returns null here, and callers render the result
    // straight into ClinicListingCard, which read `.length` off it.
    expect(orderSpecialties(null)).toEqual([]);
    expect(orderSpecialties(null, "nakke")).toEqual([]);
    expect(orderSpecialties(undefined)).toEqual([]);
  });
});
