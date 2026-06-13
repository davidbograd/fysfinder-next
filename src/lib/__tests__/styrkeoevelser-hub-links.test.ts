import { bodyPartPhraseInSentence } from "@/lib/styrkeoevelser";
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
});
