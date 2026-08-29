/**
 * Tests that shared Google Place IDs still produce per-clinic map coordinates.
 */

import { selectClinicsSharingPlaceIdAcrossPostcodes } from "../shared-place-coordinates";

describe("selectClinicsSharingPlaceIdAcrossPostcodes", () => {
  it("selects every clinic in a Place ID group with different postcodes", () => {
    const hqPlaceId = "ChIJjfDrqg1nUCQRBWAk7o9jCIo";
    const selected = selectClinicsSharingPlaceIdAcrossPostcodes([
      {
        clinics_id: "vanloese",
        google_place_id: hqPlaceId,
        postnummer: 2720,
        adresse: "Slotsherrensvej 1, 1 tv",
        lokation: "Vanløse",
      },
      {
        clinics_id: "aarhus",
        google_place_id: hqPlaceId,
        postnummer: 8000,
        adresse: "Kirkedammen 29A",
        lokation: "Aarhus C",
      },
      {
        clinics_id: "same-city-duplicate",
        google_place_id: "other-place",
        postnummer: 8000,
        adresse: "Kirkedammen 29A",
        lokation: "Aarhus C",
      },
      {
        clinics_id: "same-city-other",
        google_place_id: "other-place",
        postnummer: 8000,
        adresse: "Kirkedammen 29A, 1",
        lokation: "Aarhus C",
      },
    ]);

    expect(selected.map((clinic) => clinic.clinics_id).sort()).toEqual([
      "aarhus",
      "vanloese",
    ]);
  });

  it("ignores unique Place IDs", () => {
    expect(
      selectClinicsSharingPlaceIdAcrossPostcodes([
        {
          clinics_id: "only",
          google_place_id: "unique",
          postnummer: 8000,
        },
      ])
    ).toEqual([]);
  });
});
