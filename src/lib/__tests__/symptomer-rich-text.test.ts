// Added: 2026-09-07 - Covers the inline-markup parser that lets symptom content data carry crawlable links and bold runs.

import {
  extractRichTextHrefs,
  parseRichText,
  richTextToPlainText,
} from "@/lib/symptomer/rich-text";

describe("parseRichText", () => {
  it("returns a single text token for plain copy", () => {
    expect(parseRichText("Ondt i knæet")).toEqual([
      { type: "text", value: "Ondt i knæet" },
    ]);
  });

  it("splits out inline links and keeps surrounding text", () => {
    expect(
      parseRichText("Se [øvelser til knæet](/styrkeoevelser/knae) her")
    ).toEqual([
      { type: "text", value: "Se " },
      {
        type: "link",
        label: "øvelser til knæet",
        href: "/styrkeoevelser/knae",
      },
      { type: "text", value: " her" },
    ]);
  });

  it("parses bold runs", () => {
    expect(parseRichText("ikke til at **stille en diagnose**")).toEqual([
      { type: "text", value: "ikke til at " },
      { type: "bold", value: "stille en diagnose" },
    ]);
  });

  it("keeps unmatched brackets and asterisks as literal text", () => {
    const input = "Se [her og 2 * 3";
    expect(parseRichText(input)).toEqual([{ type: "text", value: input }]);
  });

  it("does not share regex state between calls", () => {
    const input = "[a](/a) og [b](/b)";
    expect(parseRichText(input)).toEqual(parseRichText(input));
  });
});

describe("richTextToPlainText", () => {
  it("strips markup so JSON-LD and meta text stay clean", () => {
    expect(
      richTextToPlainText(
        "Find en [fysioterapeut](/find/fysioterapeut/danmark) – **ikke** en diagnose"
      )
    ).toBe("Find en fysioterapeut – ikke en diagnose");
  });
});

describe("extractRichTextHrefs", () => {
  it("returns every referenced href", () => {
    expect(
      extractRichTextHrefs("[a](/styrkeoevelser) og [b](#oevelser)")
    ).toEqual(["/styrkeoevelser", "#oevelser"]);
  });
});
