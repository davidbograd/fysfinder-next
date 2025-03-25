import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { deslugify } from "@/app/utils/slugify";
import { formatDanishDate } from "@/lib/utils";

const dictionaryDir = path.join(process.cwd(), "src/content/ordbog");

function getTermTitle(slug: string, frontmatterTitle?: string): string {
  if (frontmatterTitle) {
    return frontmatterTitle;
  }
  // Convert slug to title with only first letter capitalized
  // e.g., "frossen-skulder" -> "Frossen skulder"
  const title = deslugify(slug);
  return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
}

function getMetaTitle(title: string): string {
  return `${title} - hvad er ${title.toLowerCase()}?`;
}

function extractDescription(content: string): string {
  // Remove any images from the content first
  const contentWithoutImages = content.replace(/!\[.*?\]\(.*?\)/g, "");

  // Find the first non-empty paragraph
  const paragraphs = contentWithoutImages.split("\n\n");
  const firstParagraph = paragraphs.find((p) => p.trim() && !p.startsWith("#"));

  if (!firstParagraph) {
    return `Lær alt om denne lidelse - årsager, symptomer og behandlingsmuligheder.`;
  }

  // Clean up the paragraph (remove markdown formatting)
  const cleanParagraph = firstParagraph
    .replace(/\*\*/g, "") // Remove bold
    .replace(/\*/g, "") // Remove italic
    .replace(/\[|\]/g, "") // Remove link brackets
    .replace(/\(http[^)]+\)/g, "") // Remove link URLs
    .trim();

  // Truncate if too long (keeping full words)
  if (cleanParagraph.length > 160) {
    const truncated = cleanParagraph
      .slice(0, 157)
      .split(" ")
      .slice(0, -1)
      .join(" ");
    return truncated + "...";
  }

  return cleanParagraph;
}

export async function getDictionaryTerms() {
  const files = await fs.readdir(dictionaryDir);
  const terms = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const filePath = path.join(dictionaryDir, file);
      const content = await fs.readFile(filePath, "utf-8");
      const { content: markdownContent, data } = matter(content);

      return {
        slug,
        title: getTermTitle(slug, data.title),
        description: extractDescription(markdownContent),
      };
    })
  );
  return terms.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getDictionaryTerm(slug: string) {
  const filePath = path.join(dictionaryDir, `${slug}.md`);
  const content = await fs.readFile(filePath, "utf-8");
  const { content: markdownContent, data } = matter(content);

  // Pre-process the markdown content to ensure images are not wrapped in p tags
  const processedContent = markdownContent.replace(
    /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/gm,
    '<Image src="$2" alt="$1" width={1200} height={800} layout="responsive" className="rounded-lg my-4" />'
  );

  const title = getTermTitle(slug, data.title);

  return {
    slug,
    title,
    description: extractDescription(markdownContent),
    content: processedContent,
    lastUpdated: data.lastUpdated || formatDanishDate(new Date()),
    datePublished: data.datePublished || "19/02/2025",
    metaTitle: data.metaTitle || `${title} - hvad er ${title.toLowerCase()}?`,
  };
}
