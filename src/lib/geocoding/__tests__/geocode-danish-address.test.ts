/**
 * Tests for DAWA clinic-address geocoding used by Fysfinder map pins.
 */

import {
  buildDanishAddressQuery,
  geocodeDanishAddress,
} from "../geocode-danish-address";

describe("buildDanishAddressQuery", () => {
  it("joins street, postcode, and city", () => {
    expect(
      buildDanishAddressQuery({
        adresse: "Kirkedammen 29A",
        postnummer: 8000,
        lokation: "Aarhus C",
      })
    ).toBe("Kirkedammen 29A, 8000 Aarhus C");
  });

  it("returns null when every part is empty", () => {
    expect(
      buildDanishAddressQuery({
        adresse: "  ",
        postnummer: null,
        lokation: "",
      })
    ).toBeNull();
  });
});

describe("geocodeDanishAddress", () => {
  it("returns the clinic address coordinates and prefers a matching postcode", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { x: 12.49, y: 55.69, postnr: "2720" },
        { x: 10.17768914, y: 56.14007208, postnr: "8000" },
      ],
    });

    const coordinates = await geocodeDanishAddress(
      {
        adresse: "Kirkedammen 29A",
        postnummer: 8000,
        lokation: "Aarhus C",
      },
      fetchImpl as unknown as typeof fetch
    );

    expect(coordinates).toEqual({
      latitude: 56.14007208,
      longitude: 10.17768914,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const requestedUrl = String(fetchImpl.mock.calls[0][0]);
    expect(requestedUrl).toContain("api.dataforsyningen.dk/adresser");
    expect(requestedUrl).toContain("Kirkedammen");
  });

  it("falls back to adgangsadresser when the full-address search is empty", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ x: 12.50641497, y: 55.65240101, postnr: "2500" }],
      });

    const coordinates = await geocodeDanishAddress(
      {
        adresse: "Værkstedvej 46",
        postnummer: 2500,
        lokation: "Valby",
      },
      fetchImpl as unknown as typeof fetch
    );

    expect(coordinates).toEqual({
      latitude: 55.65240101,
      longitude: 12.50641497,
    });
    expect(String(fetchImpl.mock.calls[1][0])).toContain("adgangsadresser");
  });
});
