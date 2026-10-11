import fs from "fs";
import path from "path";
import {
  getRelatedTools,
  isToolSlug,
  MAX_RELATED_TOOLS,
  releasedTools,
  tools,
} from "@/lib/tools/registry";

const seoTextDir = path.join(process.cwd(), "src/content/vaerktoejer-seo-text");

function toolLinksInSeoText(slug: string): string[] {
  const filePath = path.join(seoTextDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  return [...content.matchAll(/\]\(\/vaerktoejer\/([a-z0-9-]+)\)/g)].map(
    (match) => match[1]
  );
}

describe("related tools (Andre nyttige værktøjer)", () => {
  it("only references registered tools and never the tool itself", () => {
    for (const tool of tools) {
      for (const relatedSlug of tool.relatedTools) {
        expect(isToolSlug(relatedSlug)).toBe(true);
        expect(relatedSlug).not.toBe(tool.slug);
      }
      expect(new Set(tool.relatedTools).size).toBe(tool.relatedTools.length);
    }
  });

  it("shows at most 3 distinct released tools, never the current one", () => {
    const releasedSlugs = releasedTools.map((tool) => tool.slug);
    for (const tool of releasedTools) {
      const related = getRelatedTools(tool.slug).map((t) => t.slug);
      expect(related.length).toBeGreaterThan(0);
      expect(related.length).toBeLessThanOrEqual(MAX_RELATED_TOOLS);
      expect(new Set(related).size).toBe(related.length);
      expect(related).not.toContain(tool.slug);
      for (const slug of related) expect(releasedSlugs).toContain(slug);
    }
  });

  it("shows only the relevant tools, in order, when there are fewer than 3", () => {
    expect(getRelatedTools("pace-beregner").map((t) => t.slug)).toEqual([
      "kondital-beregner",
    ]);
    expect(getRelatedTools("kalorieberegner").map((t) => t.slug)).toEqual([
      "hvilestofskifte-beregner",
      "proteinberegner",
      "bmi-beregner",
    ]);
  });

  it("falls back to 3 stable random tools when none are relevant", () => {
    for (const slug of ["hoejdeberegner", "mr-scanning"] as const) {
      const first = getRelatedTools(slug).map((t) => t.slug);
      expect(first).toHaveLength(MAX_RELATED_TOOLS);
      expect(first).not.toContain(slug);
      expect(getRelatedTools(slug).map((t) => t.slug)).toEqual(first);
    }
  });
});

describe("tool links in the SEO body text", () => {
  it("links each other tool at most once, to an existing tool, never to itself", () => {
    for (const tool of tools) {
      const links = toolLinksInSeoText(tool.slug);
      expect(new Set(links).size).toBe(links.length);
      for (const linkedSlug of links) {
        expect(isToolSlug(linkedSlug)).toBe(true);
        expect(linkedSlug).not.toBe(tool.slug);
      }
    }
  });
});
