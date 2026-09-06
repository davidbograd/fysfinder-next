// Updated: 2026-09-06 - Caps map markers and computes specialty counts without full clinic payloads.

import { Clinic } from "@/app/types";
import {
  getLocationMapClinics,
  getSpecialtyMatchCounts,
  LOCATION_MAP_MARKER_LIMIT,
} from "../location-listing";

function makeClinic(
  index: number,
  overrides: Partial<Clinic> = {}
): Clinic {
  return {
    clinics_id: `clinic-${index}`,
    klinikNavn: `Klinik ${index}`,
    antalBehandlere: 1,
    ydernummer: false,
    avgRating: 4,
    ratingCount: 1,
    lokation: "København",
    lokationSlug: "koebenhavn",
    klinikNavnSlug: `klinik-${index}`,
    adresse: "Gade 1",
    postnummer: 2100,
    website: "",
    tlf: "",
    email: "",
    førsteKons: 0,
    opfølgning: 0,
    første_kons_minutter: 0,
    opfølgning_minutter: 0,
    mandag: "",
    tirsdag: "",
    onsdag: "",
    torsdag: "",
    fredag: "",
    lørdag: "",
    søndag: "",
    parkering: "",
    handicapadgang: null,
    god_adgang_verificeret: false,
    holdtræning: "",
    hjemmetræning: "",
    northstar: false,
    om_os: null,
    specialties: [],
    latitude: 55.67 + index * 0.001,
    longitude: 12.56,
    ...overrides,
  };
}

describe("getLocationMapClinics", () => {
  it("keeps slim mappable clinics and caps the marker count", () => {
    const clinics = Array.from({ length: LOCATION_MAP_MARKER_LIMIT + 5 }, (_, index) =>
      makeClinic(index)
    );
    clinics[0] = makeClinic(0, { latitude: null, longitude: null });

    const markers = getLocationMapClinics(clinics);

    expect(markers).toHaveLength(LOCATION_MAP_MARKER_LIMIT);
    expect(markers[0]).toEqual(
      expect.objectContaining({
        clinics_id: "clinic-1",
        klinikNavn: "Klinik 1",
        klinikNavnSlug: "klinik-1",
      })
    );
    expect(markers[0]).not.toHaveProperty("team_members");
    expect(markers[0]).not.toHaveProperty("specialties");
  });
});

describe("getSpecialtyMatchCounts", () => {
  it("counts clinics per specialty", () => {
    const counts = getSpecialtyMatchCounts(
      [
        makeClinic(1, {
          specialties: [
            {
              specialty_id: "s1",
              specialty_name: "Ryg",
              specialty_name_slug: "ryg",
            },
          ],
        }),
        makeClinic(2, {
          specialties: [
            {
              specialty_id: "s1",
              specialty_name: "Ryg",
              specialty_name_slug: "ryg",
            },
            {
              specialty_id: "s2",
              specialty_name: "Knæ",
              specialty_name_slug: "knae",
            },
          ],
        }),
      ],
      [
        { specialty_id: "s1", specialty_name_slug: "ryg" },
        { specialty_id: "s2", specialty_name_slug: "knae" },
        { specialty_id: "s3", specialty_name_slug: "skulder" },
      ]
    );

    expect(counts).toEqual({ s1: 2, s2: 1, s3: 0 });
  });
});
