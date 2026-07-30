import { splitLeadParagraph } from "@/lib/styrkeoevelser";

describe("splitLeadParagraph", () => {
  it("returns the first prose paragraph as lead and the remainder as rest", () => {
    const content = "Intro paragraph.\n\n## Heading\n\nBody text.";
    const { lead, rest } = splitLeadParagraph(content);
    expect(lead).toBe("Intro paragraph.");
    expect(rest).toBe("## Heading\n\nBody text.");
  });

  it("skips leading headings when finding the lead paragraph", () => {
    const content = "# Title\n\nFirst real paragraph.\n\nSecond paragraph.";
    const { lead, rest } = splitLeadParagraph(content);
    expect(lead).toBe("First real paragraph.");
    expect(rest).toBe("# Title\n\nSecond paragraph.");
  });

  it("returns an empty lead when there is no prose paragraph", () => {
    const content = "## Only a heading";
    const { lead, rest } = splitLeadParagraph(content);
    expect(lead).toBe("");
    expect(rest).toBe("## Only a heading");
  });
});
