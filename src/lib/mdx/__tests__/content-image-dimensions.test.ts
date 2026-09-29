import fs from "fs";
import path from "path";
import {
  getContentImageSize,
  getRegisteredContentImages,
} from "@/lib/mdx/content-image-dimensions";

const toolPagesDir = path.join(process.cwd(), "src/app/vaerktoejer");
const contentDir = path.join(process.cwd(), "src/content/vaerktoejer-seo-text");

/** Slugs whose SEO markdown is rendered through ToolPageLayout's MDX image component. */
function slugsRenderedByToolPageLayout(): string[] {
  return fs
    .readdirSync(toolPagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => {
      const page = path.join(toolPagesDir, entry.name, "page.tsx");
      return (
        fs.existsSync(page) &&
        fs.readFileSync(page, "utf-8").includes("ToolPageLayout")
      );
    })
    .map((entry) => entry.name);
}

function localImagesIn(markdown: string): string[] {
  return [...markdown.matchAll(/!\[[^\]]*\]\(\s*(\/[^\s)]+)/g)].map((m) => m[1]);
}

describe("content image dimensions", () => {
  it("knows the kondital reference table and nothing it was not told about", () => {
    expect(
      getContentImageSize("/images/vaerktoejer/kondital-tabel-alder-koen.png")
    ).not.toBeNull();
    expect(getContentImageSize("/images/not-registered.png")).toBeNull();
  });

  it("registers every image the tool pages reference, so none falls back to a cropped box", () => {
    const registered = getRegisteredContentImages();
    const missing: string[] = [];

    for (const slug of slugsRenderedByToolPageLayout()) {
      const markdownPath = path.join(contentDir, `${slug}.md`);
      if (!fs.existsSync(markdownPath)) continue;

      for (const src of localImagesIn(fs.readFileSync(markdownPath, "utf-8"))) {
        if (!registered.includes(src)) missing.push(`${slug}: ${src}`);
      }
    }

    expect(missing).toEqual([]);
  });

  it("points every registered image at a file that exists", () => {
    for (const src of getRegisteredContentImages()) {
      expect(fs.existsSync(path.join(process.cwd(), "public", src))).toBe(true);
    }
  });
});
