import {
  parseRelatedFrontmatter,
  resolveRelatedLinks,
} from "@/lib/related-content";

describe("related content helpers", () => {
  it("parseRelatedFrontmatter keeps valid curated entries and drops invalid ones", () => {
    const items = parseRelatedFrontmatter({
      related: [
        {
          type: "styrkeoevelser",
          slug: "skulder",
          title: "Skulderøvelser",
        },
        { type: "ordbog", slug: "knae" }, // missing title
        { type: "blog", slug: "post", title: "A post" },
        { type: "clinic", slug: "x", title: "Nope" },
      ],
    });

    expect(items).toEqual([
      {
        type: "styrkeoevelser",
        slug: "skulder",
        title: "Skulderøvelser",
      },
      { type: "blog", slug: "post", title: "A post" },
    ]);
  });

  it("resolveRelatedLinks builds hrefs and drops self-links and duplicates", () => {
    const links = resolveRelatedLinks(
      [
        {
          type: "ordbog",
          slug: "skulder",
          title: "Skulder",
        },
        {
          type: "styrkeoevelser",
          slug: "skulder",
          title: "Skulderøvelser",
        },
        {
          type: "ordbog",
          slug: "skulder",
          title: "Skulder again",
        },
        {
          type: "page",
          slug: "/mr-scanning",
          title: "MR-scanning oversætter",
        },
      ],
      "/ordbog/skulder"
    );

    expect(links).toEqual([
      { href: "/styrkeoevelser/skulder", title: "Skulderøvelser" },
      { href: "/mr-scanning", title: "MR-scanning oversætter" },
    ]);
  });
});
