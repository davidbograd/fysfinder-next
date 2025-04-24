import fs from "fs/promises";
import * as path from "path";
import matter from "gray-matter";

const glossaryDir = path.join(process.cwd(), "src/content/blog");

export async function getGlossaryTerms() {
  const files = await fs.readdir(glossaryDir);
  const terms = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(path.join(glossaryDir, file), "utf-8");
      const { data } = matter(content);
      return {
        slug: file.replace(/\.md$/, ""),
        title: data.title,
        description: data.description,
      };
    })
  );
  return terms.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getGlossaryTerm(slug: string) {
  const filePath = path.join(glossaryDir, `${slug}.md`);
  const content = await fs.readFile(filePath, "utf-8");
  const { data, content: markdownContent } = matter(content);

  // Pre-process the markdown content to ensure images are not wrapped in p tags
  const processedContent = markdownContent.replace(
    /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/gm,
    '<Image src="$2" alt="$1" width={1200} height={800} layout="responsive" className="rounded-lg my-4" />'
  );

  return {
    slug,
    title: data.title,
    description: data.description,
    content: processedContent,
  };
}
