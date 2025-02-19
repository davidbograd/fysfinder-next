import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { slugify } from "@/app/utils/slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  if (minutes < 1) {
    return "under 1 minut at læse";
  } else if (minutes === 1) {
    return "1 minut at læse";
  } else {
    return `${minutes} minutter at læse`;
  }
}

export function extractTableOfContents(content: string) {
  const headings: { text: string; id: string }[] = [];
  const headingRegex = /^##\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1];
    const id = slugify(text);
    headings.push({ text, id });
  }

  return headings;
}

export function formatDanishDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
