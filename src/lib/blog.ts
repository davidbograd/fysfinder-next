import { readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { readdirSync } from "fs";

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle?: string;
  description?: string;
  datePublished: string;
  lastUpdated: string;
  content: string;
  previewImage: string;
  previewImageAlt: string;
}

function parseDanishDate(dateStr: string): Date {
  // Convert from DD-MM-YYYY to YYYY-MM-DD for proper Date parsing
  const [day, month, year] = dateStr.split("-");
  return new Date(`${year}-${month}-${day}`);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const postsDirectory = join(process.cwd(), "src/content/blog");
  const filenames = readdirSync(postsDirectory);

  const posts = filenames
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const filePath = join(postsDirectory, filename);
      const fileContents = readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug: filename.replace(/\.md$/, ""),
        title: data.title,
        metaTitle: data.metaTitle,
        description: data.description,
        datePublished: data.datePublished,
        lastUpdated: data.lastUpdated,
        content,
        previewImage:
          data.previewImage || "/images/articles/default-preview.webp",
        previewImageAlt: data.previewImageAlt || data.title,
      } as BlogPost;
    })
    // Sort by date, newest first
    .sort((a, b) => {
      const dateA = parseDanishDate(a.datePublished);
      const dateB = parseDanishDate(b.datePublished);
      return dateB.getTime() - dateA.getTime();
    });

  return posts;
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
  const filePath = join(process.cwd(), "src/content/blog", `${slug}.md`);
  const fileContents = readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  // Pre-process the markdown content to ensure images are not wrapped in p tags and have rounded corners
  const processedContent = content.replace(
    /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/gm,
    '<Image src="$2" alt="$1" width={1200} height={800} layout="responsive" className="rounded-lg my-4" />'
  );

  return {
    slug,
    title: data.title,
    metaTitle: data.metaTitle,
    description: data.description,
    datePublished: data.datePublished,
    lastUpdated: data.lastUpdated,
    content: processedContent,
    previewImage: data.previewImage || "/images/articles/default-preview.webp",
    previewImageAlt: data.previewImageAlt || data.title,
  };
}
