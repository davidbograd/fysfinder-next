import type { Element, Root, Text } from "hast";
import rehypeInternalLinks, { normalizeHref } from "../rehype-internal-links";
import type { LinkConfig } from "../types";

const linkConfig: LinkConfig = {
  linkMappings: {
    misc: [
      {
        keywords: ["proteinberegner", "proteinbehov"],
        destination: "/vaerktoejer/proteinberegner",
      },
      {
        keywords: ["fedtprocent"],
        destination: "/vaerktoejer/fedtprocent-beregner",
      },
    ],
  },
};

const text = (value: string): Text => ({ type: "text", value });
const link = (href: string, value: string): Element => ({
  type: "element",
  tagName: "a",
  properties: { href },
  children: [text(value)],
});
const paragraph = (...children: (Element | Text)[]): Element => ({
  type: "element",
  tagName: "p",
  properties: {},
  children,
});

function run(tree: Root, currentPagePath = "/vaerktoejer/watt-pr-kg-beregner") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformer = (rehypeInternalLinks as any)({
    linkConfig,
    currentPagePath,
  });
  transformer(tree);
  return tree;
}

function collectHrefs(tree: Root): string[] {
  const hrefs: string[] = [];
  const walk = (node: Root | Element) => {
    for (const child of node.children) {
      if (child.type !== "element") continue;
      if (child.tagName === "a") hrefs.push(String(child.properties?.href));
      walk(child);
    }
  };
  walk(tree);
  return hrefs;
}

describe("rehypeInternalLinks", () => {
  it("does not auto-link a keyword whose destination is already linked manually", () => {
    const tree: Root = {
      type: "root",
      children: [
        paragraph(
          text("Brug vores "),
          link("/vaerktoejer/proteinberegner", "proteinberegner"),
          text(" til at undersøge dit daglige proteinbehov.")
        ),
      ],
    };

    expect(collectHrefs(run(tree))).toEqual(["/vaerktoejer/proteinberegner"]);
  });

  it("treats manual links with trailing slash, hash or absolute URL as the same destination", () => {
    const tree: Root = {
      type: "root",
      children: [
        paragraph(
          link("https://www.fysfinder.dk/vaerktoejer/proteinberegner/#faq", "her")
        ),
        paragraph(text("Dit proteinbehov afhænger af din vægt.")),
      ],
    };

    expect(collectHrefs(run(tree))).toHaveLength(1);
  });

  it("links each destination only once per page", () => {
    const tree: Root = {
      type: "root",
      children: [
        paragraph(text("En proteinberegner viser dit proteinbehov.")),
        paragraph(text("Din fedtprocent og dit proteinbehov.")),
      ],
    };

    expect(collectHrefs(run(tree))).toEqual([
      "/vaerktoejer/proteinberegner",
      "/vaerktoejer/fedtprocent-beregner",
    ]);
  });

  it("does not leak linked state between documents", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformer = (rehypeInternalLinks as any)({
      linkConfig,
      currentPagePath: "/",
    });
    const makeTree = (): Root => ({
      type: "root",
      children: [paragraph(text("Dit proteinbehov."))],
    });

    const first = makeTree();
    const second = makeTree();
    transformer(first);
    transformer(second);

    expect(collectHrefs(first)).toHaveLength(1);
    expect(collectHrefs(second)).toHaveLength(1);
  });
});

describe("normalizeHref", () => {
  it.each([
    ["/vaerktoejer/proteinberegner/", "/vaerktoejer/proteinberegner"],
    ["/vaerktoejer/proteinberegner#faq", "/vaerktoejer/proteinberegner"],
    ["https://fysfinder.dk/ordbog/knae?x=1", "/ordbog/knae"],
    ["/", "/"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeHref(input)).toBe(expected);
  });
});
