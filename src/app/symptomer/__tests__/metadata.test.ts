// Added: 2026-09-07 - Verifies the symptom routes emit the approved meta titles, self-referencing canonicals and 404 fallbacks for inactive slugs.

import { metadata as hubMetadata } from "../page";
import { generateMetadata as bodyAreaMetadata } from "../[bodyArea]/page";
import { generateStaticParams as bodyAreaParams } from "../[bodyArea]/page";
import { generateMetadata as conditionMetadata } from "../[bodyArea]/[condition]/page";
import { generateStaticParams as conditionParams } from "../[bodyArea]/[condition]/page";

describe("/symptomer metadata", () => {
  it("uses the approved hub meta title and self-referencing canonical", () => {
    expect(hubMetadata.title).toBe(
      "Har du symptomer og smerter? → Få svar og den rette hjælp"
    );
    expect(hubMetadata.alternates?.canonical).toBe(
      "https://www.fysfinder.dk/symptomer"
    );
  });
});

describe("/symptomer/[bodyArea] metadata", () => {
  it("uses the approved knee meta title and canonical", async () => {
    const metadata = await bodyAreaMetadata({
      params: Promise.resolve({ bodyArea: "knae" }),
    });

    expect(metadata.title).toBe(
      "Ondt i knæet? → Symptomer, mulige årsager og hjælp"
    );
    expect(metadata.description).toContain("Har du ondt i knæet?");
    expect(metadata.alternates?.canonical).toBe(
      "https://www.fysfinder.dk/symptomer/knae"
    );
  });

  it("falls back to a not-found title for inactive body areas", async () => {
    const metadata = await bodyAreaMetadata({
      params: Promise.resolve({ bodyArea: "nakke" }),
    });

    expect(metadata.title).toBe("Ikke fundet");
    expect(metadata.alternates).toBeUndefined();
  });

  it("only pre-renders active body areas", () => {
    expect(bodyAreaParams()).toEqual([{ bodyArea: "knae" }]);
  });
});

describe("/symptomer/[bodyArea]/[condition] metadata", () => {
  it("uses the approved løberknæ meta title and canonical", async () => {
    const metadata = await conditionMetadata({
      params: Promise.resolve({ bodyArea: "knae", condition: "loeberknae" }),
    });

    expect(metadata.title).toBe(
      "Løberknæ → Symptomer, årsager, behandling og øvelser"
    );
    expect(metadata.alternates?.canonical).toBe(
      "https://www.fysfinder.dk/symptomer/knae/loeberknae"
    );
  });

  it("falls back to a not-found title for unknown conditions", async () => {
    const metadata = await conditionMetadata({
      params: Promise.resolve({ bodyArea: "knae", condition: "findes-ikke" }),
    });

    expect(metadata.title).toBe("Ikke fundet");
  });

  it("pre-renders all five knee conditions under the knee body area", () => {
    expect(conditionParams()).toEqual([
      { bodyArea: "knae", condition: "loeberknae" },
      { bodyArea: "knae", condition: "springerknae" },
      { bodyArea: "knae", condition: "patellofemorale-smerter" },
      { bodyArea: "knae", condition: "meniskskade" },
      { bodyArea: "knae", condition: "artrose" },
    ]);
  });
});
