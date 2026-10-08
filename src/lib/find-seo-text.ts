import fs from "fs/promises";
import path from "path";
import type { LocationFilters } from "@/app/find/fysioterapeut/filter-utils";

const contentDir = path.join(process.cwd(), "src/content/find-seo-text");

interface FindSeoTextContext {
  location: string;
  specialty?: string;
  filters: LocationFilters;
}

export function getFindSeoTextSlug({
  location,
  specialty,
  filters,
}: FindSeoTextContext): string | null {
  if (location !== "danmark" || specialty) return null;

  const { ydernummer, handicap, online } = filters;
  if (ydernummer && !handicap && !online) return "danmark-ydernummer";
  if (online && !ydernummer && !handicap) return "online";
  return null;
}

export async function getFindSeoText(
  context: FindSeoTextContext
): Promise<string | null> {
  const slug = getFindSeoTextSlug(context);
  if (!slug) return null;

  try {
    return await fs.readFile(path.join(contentDir, `${slug}.md`), "utf-8");
  } catch (error) {
    console.error(`Error reading find SEO text for ${slug}:`, error);
    return null;
  }
}
