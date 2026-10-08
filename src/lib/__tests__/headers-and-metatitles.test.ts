import {
  generateHeadings,
  generateLocationMetaTitle,
  generateMetaTitle,
  generateSpecialtyMetaTitle,
} from "@/lib/headers-and-metatitles";

describe("generateLocationMetaTitle with ydernummer filter", () => {
  it("uses the ydernummer title with the default 'i' preposition", () => {
    expect(
      generateLocationMetaTitle("København", { ydernummer: true })
    ).toBe("Find fysioterapeuter med ydernummer i København →");
  });

  it("uses 'på' when the city preposition says so", () => {
    expect(
      generateLocationMetaTitle("Amager", { ydernummer: true }, undefined, "på")
    ).toBe("Find fysioterapeuter med ydernummer på Amager →");
  });

  it("falls back to 'i' for Danmark, which has no city row", () => {
    expect(
      generateLocationMetaTitle("Danmark", { ydernummer: true }, undefined, undefined)
    ).toBe("Find fysioterapeuter med ydernummer i Danmark →");
  });

  it("keeps the combined filter title when handicap is also active", () => {
    expect(
      generateLocationMetaTitle("Amager", { ydernummer: true, handicap: true }, undefined, "på")
    ).toBe("Fysioterapeuter på Amager | Ydernummer & handicapadgang");
  });

  it("keeps the specialty title unchanged", () => {
    expect(
      generateSpecialtyMetaTitle("Amager", "Ryg", { ydernummer: true }, undefined, "på")
    ).toBe("Ryg fysioterapi på Amager | Ydernummer (vederlagsfri)");
  });
});

describe("generateHeadings location phrase", () => {
  it("prefixes the unfiltered H1 with the city preposition", () => {
    expect(generateHeadings("Amager", undefined, undefined, "på").h1).toBe(
      "Find og sammenlign fysioterapeuter på Amager"
    );
  });

  it("matches the meta title wording for the ydernummer H1", () => {
    expect(generateHeadings("Amager", undefined, { ydernummer: true }, "på")).toEqual({
      h1: "Find fysioterapeuter med ydernummer på Amager",
      h2: "Tilbyder vederlagsfri fysioterapi & henvisning fra læge",
    });
  });

  it("puts the filter before the location on the handicap H1", () => {
    expect(
      generateHeadings("København", undefined, { handicap: true }, "i").h1
    ).toBe("Find fysioterapeuter med handicapadgang i København");
  });

  it("keeps the specialty suffix after the location", () => {
    expect(
      generateHeadings("København", "Ryg", { ydernummer: true }, "i").h1
    ).toBe("Find fysioterapeuter med ydernummer i København specialiseret i ryg");
  });

  it("omits the preposition for online, which needs none", () => {
    expect(generateHeadings("online", undefined, { ydernummer: true }, null).h1).toBe(
      "Find fysioterapeuter med ydernummer online"
    );
  });

  it("defaults to 'i' for Danmark, which has no city row", () => {
    expect(generateHeadings("Danmark").h1).toBe(
      "Find og sammenlign fysioterapeuter i Danmark"
    );
  });
});

describe("online filter wording", () => {
  const online = { online: true };
  const h2 = "Tilbyder online behandling og konsultation";

  it("uses the online copy on Danmark and city pages", () => {
    expect(generateHeadings("Danmark", undefined, online)).toEqual({
      h1: "Find fysioterapeuter med online fysioterapi i Danmark",
      h2,
    });
    expect(generateMetaTitle("Danmark", undefined, online, 26)).toBe(
      "Find fysioterapeuter med online fysioterapi i Danmark →"
    );
    expect(generateHeadings("Aarhus C", undefined, online, "i")).toEqual({
      h1: "Find fysioterapeuter med online fysioterapi i Aarhus C",
      h2,
    });
    expect(generateMetaTitle("Amager", undefined, online, undefined, "på")).toBe(
      "Find fysioterapeuter med online fysioterapi på Amager →"
    );
  });

  it("uses the online copy on specialty pages", () => {
    expect(generateHeadings("Danmark", "Ryg", online)).toEqual({
      h1: "Find fysioterapeuter med online fysioterapi i Danmark specialiseret i ryg",
      h2,
    });
    expect(generateMetaTitle("Danmark", "Ryg", online)).toBe(
      "Find online ryg fysioterapi i Danmark →"
    );
    expect(generateHeadings("Aarhus C", "Ryg", online, "i").h1).toBe(
      "Find fysioterapeuter med online fysioterapi i Aarhus C specialiseret i ryg"
    );
    expect(generateMetaTitle("Aarhus C", "Ryg", online, undefined, "i")).toBe(
      "Find online ryg fysioterapi i Aarhus C →"
    );
  });

  it("lists online in the H2 and title when combined with other filters", () => {
    const combined = { online: true, ydernummer: true };
    expect(generateHeadings("Aarhus C", undefined, combined, "i")).toEqual({
      h1: "Find og sammenlign fysioterapeuter i Aarhus C",
      h2: `Tilbyder vederlagsfri fysioterapi & henvisning fra læge · ${h2}`,
    });
    expect(generateMetaTitle("Aarhus C", undefined, combined, undefined, "i")).toBe(
      "Fysioterapeuter i Aarhus C | Ydernummer & online"
    );
  });
});
