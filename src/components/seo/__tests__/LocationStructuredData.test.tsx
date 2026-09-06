// Updated: 2026-09-06 - Caps ItemList JSON-LD and keeps the total clinic count.

import { render } from "@testing-library/react";
import { LocationStructuredData } from "../LocationStructuredData";
import { LOCATION_JSON_LD_ITEM_LIMIT } from "@/lib/location-listing";

function makeClinic(index: number) {
  return {
    klinikNavn: `Klinik ${index}`,
    klinikNavnSlug: `klinik-${index}`,
    lokation: "Aarhus",
    postnummer: 8000,
    adresse: "Gade 1",
    avgRating: 4.2,
    ratingCount: 3,
    specialties: [{ specialty_name: "Ryg" }],
  };
}

describe("LocationStructuredData", () => {
  it("caps ItemList entries and reports the full clinic count", () => {
    const clinics = Array.from({ length: LOCATION_JSON_LD_ITEM_LIMIT + 5 }, (_, index) =>
      makeClinic(index + 1)
    );

    render(
      <LocationStructuredData
        isDanmarkPage
        specialtyName={null}
        clinics={clinics}
      />
    );

    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );
    const webPageSchema = JSON.parse(scripts[0].innerHTML) as {
      mainEntity: { numberOfItems: number; itemListElement: unknown[] };
    };

    expect(webPageSchema.mainEntity.numberOfItems).toBe(clinics.length);
    expect(webPageSchema.mainEntity.itemListElement).toHaveLength(
      LOCATION_JSON_LD_ITEM_LIMIT
    );
  });
});
