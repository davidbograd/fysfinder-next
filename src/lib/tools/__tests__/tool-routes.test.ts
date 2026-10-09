// Added: 2026-09-18 - MR/DEXA translators moved under /vaerktoejer/{tool}.
import fs from "fs";
import path from "path";
import {
  isToolReleased,
  releasedTools,
  tools,
  UNRELEASED_TOOL_SLUGS,
} from "@/lib/tools/registry";

type Redirect = {
  source: string;
  destination: string;
  permanent?: boolean;
};

async function getRedirects(): Promise<Redirect[]> {
  const nextConfig = (await import("../../../../next.config.js")).default;
  return nextConfig.redirects();
}

describe("tool routes", () => {
  it("serves every tool under /vaerktoejer/{slug}", () => {
    for (const tool of tools) {
      expect(tool.href).toBe(`/vaerktoejer/${tool.slug}`);
    }
  });

  it("has a page file for every registered tool", () => {
    for (const tool of tools) {
      const pagePath = path.join(
        process.cwd(),
        "src/app/vaerktoejer",
        tool.slug,
        "page.tsx"
      );
      expect(fs.existsSync(pagePath)).toBe(true);
    }
  });

  it("keeps unreleased tools out of listings and the static sitemap", () => {
    const sitemap = fs.readFileSync(
      path.join(process.cwd(), "public/sitemap-vaerktoejer.xml"),
      "utf8"
    );

    for (const slug of UNRELEASED_TOOL_SLUGS) {
      expect(isToolReleased(slug)).toBe(false);
      expect(releasedTools.map((tool) => tool.slug)).not.toContain(slug);
      expect(sitemap).not.toContain(`/vaerktoejer/${slug}<`);
    }
    expect(releasedTools.map((tool) => tool.slug)).toContain("proteinberegner");
  });

  it("permanently redirects the legacy scan URLs to their new paths", async () => {
    const redirects = await getRedirects();

    for (const slug of ["mr-scanning", "dexa-scanning"]) {
      expect(redirects).toEqual(
        expect.arrayContaining([
          {
            source: `/${slug}`,
            destination: `/vaerktoejer/${slug}`,
            permanent: true,
          },
        ])
      );
    }
  });
});
