import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "src/content/vaerktoejer-seo-text");

export async function getPageContent(pageSlug: string): Promise<string> {
  const filePath = path.join(contentDir, `${pageSlug}.md`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const { content: markdownContent } = matter(content);
    // Basic preprocessing could happen here if needed, e.g., for images
    return markdownContent;
  } catch (error) {
    console.error(`Error reading page content for ${pageSlug}:`, error);
    // Return an empty string or throw an error, depending on desired handling
    return "";
  }
}
