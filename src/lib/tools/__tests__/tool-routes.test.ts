// Added: 2026-09-18 - MR/DEXA translators moved under /vaerktoejer/{tool}.
import fs from "fs";
import path from "path";
import { tools } from "@/lib/tools/registry";

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
