import fs from "fs";
import path from "path";
import matter from "gray-matter";

const exercisesDirectory = path.join(process.cwd(), "src/content/oevelser");

export interface Exercise {
  title: string;
  slug: string;
  content: string;
  icon?: string; // Optional icon name from lucide-react
}

export function getExerciseBySlug(slug: string): Exercise | null {
  try {
    const fullPath = path.join(exercisesDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      title: data.title || "",
      slug: slug,
      content: content,
      icon: data.icon || "",
    };
  } catch (error) {
    return null;
  }
}

export function getAllExercises(): Exercise[] {
  const files = fs.readdirSync(exercisesDirectory);
  const exercises = files
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const fullPath = path.join(exercisesDirectory, filename);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        title: data.title || "",
        slug: slug,
        content: "", // We don't need the content for the list
        icon: data.icon || "",
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  return exercises;
}
