import {
  bodyPartPhraseInSentence,
  getStyrkeoevelserLinkMappings,
} from "@/lib/styrkeoevelser";
import { resolveActiveHubSectionId } from "@/lib/styrkeoevelser-hub-active-section";
import { resolveHubSectionBodyPartLinkSlugs } from "@/lib/styrkeoevelser-hub-sections";

describe("styrkeøvelser hub body-part links", () => {
  it("resolveHubSectionBodyPartLinkSlugs dedupes and preserves first-seen order", () => {
    expect(
      resolveHubSectionBodyPartLinkSlugs(
        ["ryg", "laend", "ryg", "ukendt"],
        ["ryg", "laend", "bagl"]
      )
    ).toEqual(["ryg", "laend"]);
  });

  it("bodyPartPhraseInSentence lowercases first character for Danish mid-sentence copy", () => {
    expect(bodyPartPhraseInSentence("Arme")).toBe("arme");
    expect(bodyPartPhraseInSentence("")).toBe("");
  });

  it("maps plural 'arme' to the arm body-part page (not ordbog)", () => {
    const arm = getStyrkeoevelserLinkMappings().find(
      (m) => m.destination === "/styrkeoevelser/arm"
    );
    expect(arm).toBeDefined();
    const keywords = (arm?.keywords ?? []).map((k) => k.toLowerCase());
    expect(keywords).toEqual(expect.arrayContaining(["arm", "arme", "armene"]));
  });

  it("maps skulder inflections (incl. skuldre) to the skulder body-part page", () => {
    const skulder = getStyrkeoevelserLinkMappings().find(
      (m) => m.destination === "/styrkeoevelser/skulder"
    );
    expect(skulder).toBeDefined();
    const keywords = (skulder?.keywords ?? []).map((k) => k.toLowerCase());
    expect(keywords).toEqual(
      expect.arrayContaining(["skulder", "skulderen", "skuldre", "skuldrene"])
    );
  });

  it("resolveActiveHubSectionId selects the last section that crossed the sticky line", () => {
    const sections = [
      { id: "hub-arme", top: -40 },
      { id: "hub-skuldre", top: 120 },
      { id: "hub-bryst", top: 400 },
    ];
    // Section landed just under a 128px sticky bar should still activate.
    expect(resolveActiveHubSectionId(sections, 128)).toBe("hub-skuldre");
    expect(resolveActiveHubSectionId(sections, 100)).toBe("hub-arme");
    expect(resolveActiveHubSectionId(sections, 500)).toBe("hub-bryst");
  });
});
