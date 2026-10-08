import { getFindSeoText, getFindSeoTextSlug } from "@/lib/find-seo-text";

describe("getFindSeoTextSlug", () => {
  it("returns the ydernummer text for Danmark with only the ydernummer filter", () => {
    expect(
      getFindSeoTextSlug({ location: "danmark", filters: { ydernummer: true } })
    ).toBe("danmark-ydernummer");
  });

  it("returns the online text for Danmark with only the online filter", () => {
    expect(
      getFindSeoTextSlug({ location: "danmark", filters: { online: true } })
    ).toBe("online");
  });

  it.each([
    ["unfiltered Danmark", { location: "danmark", filters: {} }],
    ["a city with online", { location: "aarhus", filters: { online: true } }],
    [
      "Danmark specialty with online",
      { location: "danmark", specialty: "sportsskader", filters: { online: true } },
    ],
    [
      "a city with ydernummer",
      { location: "aarhus", filters: { ydernummer: true } },
    ],
    [
      "Danmark specialty with ydernummer",
      { location: "danmark", specialty: "sportsskader", filters: { ydernummer: true } },
    ],
    [
      "Danmark with ydernummer and handicap",
      { location: "danmark", filters: { ydernummer: true, handicap: true } },
    ],
    [
      "Danmark with ydernummer and online",
      { location: "danmark", filters: { ydernummer: true, online: true } },
    ],
  ])("returns null for %s", (_label, context) => {
    expect(getFindSeoTextSlug(context)).toBeNull();
  });
});

describe("getFindSeoText", () => {
  it("loads the Danmark ydernummer markdown", async () => {
    const text = await getFindSeoText({
      location: "danmark",
      filters: { ydernummer: true },
    });
    expect(text).toContain("## Find fysioterapeuter med ydernummer i Danmark");
  });

  it("loads the online markdown", async () => {
    const text = await getFindSeoText({
      location: "danmark",
      filters: { online: true },
    });
    expect(text).toContain("## Hvad er online fysioterapi?");
  });
});
