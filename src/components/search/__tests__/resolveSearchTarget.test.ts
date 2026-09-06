import { SearchResult } from "@/app/types";
import { resolveSearchTarget } from "../resolveSearchTarget";

const knae = {
  specialty_id: "1",
  specialty_name: "Knæ",
  specialty_name_slug: "knae",
};

function cityResult(name: string, slug: string): SearchResult {
  return {
    exact_match: null,
    nearby_cities: [
      {
        id: slug,
        bynavn: name,
        bynavn_slug: slug,
        postal_codes: [],
        latitude: 0,
        longitude: 0,
        betegnelse: "",
        distance: -1,
      },
    ],
  };
}

describe("resolveSearchTarget", () => {
  it("uses the selected location when present", async () => {
    const result = await resolveSearchTarget({
      location: { name: "Aarhus C", slug: "aarhus-c" },
      locationDraft: "something else",
      specialty: null,
      specialtyDraft: "",
      fetchCities: jest.fn(),
    });

    expect(result).toMatchObject({
      ok: true,
      url: "/find/fysioterapeut/aarhus-c",
    });
  });

  it("resolves typed location text instead of falling back to Danmark", async () => {
    const fetchCities = jest.fn().mockResolvedValue(cityResult("Aarhus C", "aarhus-c"));

    const result = await resolveSearchTarget({
      location: null,
      locationDraft: "arhus",
      specialty: null,
      specialtyDraft: "",
      fetchCities,
    });

    expect(fetchCities).toHaveBeenCalledWith("arhus");
    expect(result).toMatchObject({
      ok: true,
      url: "/find/fysioterapeut/aarhus-c",
    });
  });

  it("falls back to Danmark when the location field is empty", async () => {
    const result = await resolveSearchTarget({
      location: null,
      locationDraft: "",
      specialty: { name: "Knæ", slug: "knae", id: "1" },
      specialtyDraft: "Knæ",
    });

    expect(result).toMatchObject({
      ok: true,
      url: "/find/fysioterapeut/danmark/knae",
    });
  });

  it("does not navigate when typed location text has no match", async () => {
    const result = await resolveSearchTarget({
      location: null,
      locationDraft: "xyzzy",
      specialty: null,
      specialtyDraft: "",
      fetchCities: jest.fn().mockResolvedValue({
        exact_match: null,
        nearby_cities: [],
      }),
    });

    expect(result).toEqual({ ok: false, reason: "no-location-match" });
  });

  it("resolves a typed specialty when none is selected", async () => {
    const result = await resolveSearchTarget({
      location: { name: "Odense", slug: "odense" },
      locationDraft: "Odense",
      specialty: null,
      specialtyDraft: "knae",
      specialties: [knae, { specialty_id: "2", specialty_name: "Ryg", specialty_name_slug: "ryg" }],
    });

    expect(result).toMatchObject({
      ok: true,
      url: "/find/fysioterapeut/odense/knae",
    });
  });
});
