import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { deslugify } from "@/app/utils/slugify";
import { formatDanishDate } from "@/lib/utils";
import type { LinkMapping } from "lib/internal-linking/types";

export const STYRKEOEVELSER_PATH = "/styrkeoevelser";

const KROPSDELE_IMAGE_BASE = "/images/styrkeoevelser/kropsdele";

/** Maps each body-part slug to its hero image path under `public/`. */
export const BODY_PART_HERO_IMAGES: Record<string, string> = {
  albue: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-albue.jpg`,
  haandled: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-haandled.jpg`,
  arm: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-arme.jpg`,
  bryst: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-bryst.jpg`,
  mave: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-core-mave.jpg`,
  fod: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-fod.jpg`,
  ankel: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-ankel.jpg`,
  hofte: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-hofte.jpg`,
  ben: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-ben.jpg`,
  knae: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-knae.jpg`,
  nakke: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-nakke.jpg`,
  ryg: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-ryg.jpg`,
  laend: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-laend.jpg`,
  skulder: `${KROPSDELE_IMAGE_BASE}/styrkeovelser-skulder.jpg`,
};
export const STYRKEOEVELSER_SITE_URL = "https://www.fysfinder.dk";
export const DEFINED_TERM_SET_ID = `${STYRKEOEVELSER_SITE_URL}${STYRKEOEVELSER_PATH}#defined-term-set`;

/** Token in `src/content/styrkeoevelser/index.md`; hub page replaces with live count. */
export const STYRKEOEVELSER_INDEX_EXERCISE_COUNT_TOKEN =
  "__STYRKEOEVELSER_EXERCISE_COUNT__";

const contentRoot = path.join(process.cwd(), "src/content/styrkeoevelser");
const kropsdeleDir = path.join(contentRoot, "kropsdele");
const ovelserDir = path.join(contentRoot, "ovelser");
const indexPath = path.join(contentRoot, "index.md");

export type StyrkeoevelserBodyPart = {
  slug: string;
  /** Short display name used in pills, breadcrumbs, and hub links (e.g. "Knæ"). */
  title: string;
  /** Long-form page H1 (e.g. "Knæøvelser – Træningsøvelser til styrke af knæ"). Falls back to title if absent. */
  h1?: string;
  description: string;
  content: string;
  metaTitle?: string;
  lastUpdated: string;
  datePublished: string;
};

export type StyrkeoevelserDifficulty = "begynder" | "oevet" | "avanceret";

export type StyrkeoevelserExercise = {
  slug: string;
  title: string;
  description: string;
  content: string;
  bodyParts: string[];
  metaTitle?: string;
  lastUpdated: string;
  datePublished: string;
  author?: string;
  videoUrl?: string;
  videoName?: string;
  videoThumbnailUrl?: string;
  /** Card / listing image under `public/` (e.g. `/images/styrkeoevelser/foo.png`). */
  previewImage?: string;
  previewImageAlt?: string;
  /** Vist på kort, fx "Kropsvægt", "Barbell", "Håndvægt". */
  equipment?: string;
  difficulty?: StyrkeoevelserDifficulty;
};

function extractDescription(content: string): string {
  const contentWithoutImages = content.replace(/!\[.*?\]\(.*?\)/g, "");
  const paragraphs = contentWithoutImages.split("\n\n");
  const firstParagraph = paragraphs.find(
    (p) => p.trim() && !p.startsWith("#")
  );

  if (!firstParagraph) {
    return "Styrkeøvelse på Fysfinder.";
  }

  const cleanParagraph = firstParagraph
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\[|\]/g, "")
    .replace(/\(http[^)]+\)/g, "")
    .trim();

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

/**
 * Splits markdown body content into its first prose paragraph (the "lead",
 * used in the body-part hero) and the remaining content (rendered as the SEO
 * article). Skips leading blank lines and any heading blocks.
 */
export function splitLeadParagraph(content: string): {
  lead: string;
  rest: string;
} {
  const blocks = content.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const leadIndex = blocks.findIndex(
    (block) => block.trim() !== "" && !block.trim().startsWith("#")
  );

  if (leadIndex === -1) {
    return { lead: "", rest: content.trim() };
  }

  const lead = blocks[leadIndex].trim();
  const rest = [...blocks.slice(0, leadIndex), ...blocks.slice(leadIndex + 1)]
    .join("\n\n")
    .trim();

  return { lead, rest };
}

export type ExerciseHowTo = {
  /** Section heading, e.g. "Lunges - Sådan gør du". */
  heading: string;
  /** Ordered list of instruction steps (markdown stripped of the "N." prefix). */
  steps: string[];
  /** Optional callout after the steps, e.g. "Antal gentagelser: …". */
  note: { label: string; text: string } | null;
};

/**
 * Splits exercise markdown into:
 *  - `lead`: the first prose paragraph (hero),
 *  - `howTo`: the "… Sådan gør du" section parsed into visual steps,
 *  - `rest`: the remaining content (SEO article), with the lead and the
 *    how-to section removed so nothing is rendered twice.
 */
export function parseExerciseHowTo(content: string): {
  lead: string;
  howTo: ExerciseHowTo | null;
  rest: string;
} {
  const blocks = content.replace(/\r\n/g, "\n").split(/\n{2,}/);

  const leadIndex = blocks.findIndex(
    (block) => block.trim() !== "" && !block.trim().startsWith("#")
  );
  const lead = leadIndex === -1 ? "" : blocks[leadIndex].trim();

  const headingIndex = blocks.findIndex((block) =>
    /^##\s+.*Sådan gør du\s*$/i.test(block.trim())
  );

  let howTo: ExerciseHowTo | null = null;
  const removedIndexes = new Set<number>();

  if (headingIndex !== -1) {
    const heading = blocks[headingIndex].trim().replace(/^#{1,6}\s+/, "");
    const steps: string[] = [];
    let note: ExerciseHowTo["note"] = null;
    const sectionIndexes: number[] = [headingIndex];

    for (let i = headingIndex + 1; i < blocks.length; i++) {
      const trimmed = blocks[i].trim();
      if (trimmed.startsWith("## ")) {
        break;
      }
      sectionIndexes.push(i);

      const orderedItems = trimmed
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^\d+\.\s+/.test(line));

      if (orderedItems.length > 0) {
        for (const item of orderedItems) {
          steps.push(item.replace(/^\d+\.\s+/, "").trim());
        }
        continue;
      }

      const noteMatch = trimmed.match(/^\*\*(.+?):\*\*\s*([\s\S]*)$/);
      if (noteMatch && !note) {
        note = { label: noteMatch[1].trim(), text: noteMatch[2].trim() };
      }
    }

    if (steps.length > 0) {
      howTo = { heading, steps, note };
      sectionIndexes.forEach((i) => removedIndexes.add(i));
    }
  }

  const rest = blocks
    .filter((_, index) => index !== leadIndex && !removedIndexes.has(index))
    .join("\n\n")
    .trim();

  return { lead, howTo, rest };
}

function getTitleFromSlug(slug: string, frontmatterTitle?: string): string {
  if (frontmatterTitle) {
    return frontmatterTitle;
  }
  const title = deslugify(slug);
  return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
}

function listMdSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function processMarkdownImages(markdown: string): string {
  return markdown.replace(
    /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/gm,
    '<Image src="$2" alt="$1" width={1200} height={800} layout="responsive" className="rounded-lg my-4" />'
  );
}

export function getStyrkeoevelserIndexContent(): {
  content: string;
  title: string;
  description: string;
  metaTitle?: string;
} | null {
  if (!fs.existsSync(indexPath)) {
    return null;
  }
  const raw = fs.readFileSync(indexPath, "utf-8");
  const { content: body, data } = matter(raw);
  const title =
    typeof data.title === "string"
      ? data.title
      : "Styrkeøvelser – træning og teknik";
  return {
    content: processMarkdownImages(body),
    title,
    description:
      typeof data.description === "string"
        ? data.description
        : extractDescription(body),
    metaTitle: typeof data.metaTitle === "string" ? data.metaTitle : undefined,
  };
}

export function getBodyPartSlugs(): string[] {
  return listMdSlugs(kropsdeleDir);
}

export function getExerciseSlugs(): string[] {
  return listMdSlugs(ovelserDir);
}

function assertNoSlugCollision(): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  const bp = new Set(getBodyPartSlugs());
  for (const slug of getExerciseSlugs()) {
    if (bp.has(slug)) {
      console.warn(
        `[styrkeoevelser] slug collision: "${slug}" exists as both kropsdel and øvelse`
      );
    }
  }
}

export function getBodyPart(slug: string): StyrkeoevelserBodyPart {
  assertNoSlugCollision();
  const filePath = path.join(kropsdeleDir, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content: markdownContent, data } = matter(raw);
  const title = getTitleFromSlug(slug, data.title);

  return {
    slug,
    title,
    h1: typeof data.h1 === "string" ? data.h1 : undefined,
    description:
      typeof data.description === "string"
        ? data.description
        : extractDescription(markdownContent),
    content: processMarkdownImages(markdownContent),
    metaTitle: typeof data.metaTitle === "string" ? data.metaTitle : undefined,
    lastUpdated:
      typeof data.lastUpdated === "string"
        ? data.lastUpdated
        : formatDanishDate(new Date()),
    datePublished:
      typeof data.datePublished === "string"
        ? data.datePublished
        : formatDanishDate(new Date()),
  };
}

export function getExercise(slug: string): StyrkeoevelserExercise {
  assertNoSlugCollision();
  const filePath = path.join(ovelserDir, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content: markdownContent, data } = matter(raw);
  const title = getTitleFromSlug(slug, data.title);
  const bodyParts = Array.isArray(data.bodyParts)
    ? (data.bodyParts as string[]).filter((s) => typeof s === "string")
    : [];

  return {
    slug,
    title,
    description:
      typeof data.description === "string"
        ? data.description
        : extractDescription(markdownContent),
    content: processMarkdownImages(markdownContent),
    bodyParts,
    metaTitle: typeof data.metaTitle === "string" ? data.metaTitle : undefined,
    lastUpdated:
      typeof data.lastUpdated === "string"
        ? data.lastUpdated
        : formatDanishDate(new Date()),
    datePublished:
      typeof data.datePublished === "string"
        ? data.datePublished
        : formatDanishDate(new Date()),
    author: typeof data.author === "string" ? data.author : undefined,
    videoUrl: typeof data.videoUrl === "string" ? data.videoUrl : undefined,
    videoName: typeof data.videoName === "string" ? data.videoName : undefined,
    videoThumbnailUrl:
      typeof data.videoThumbnailUrl === "string"
        ? data.videoThumbnailUrl
        : undefined,
    previewImage:
      typeof data.previewImage === "string" ? data.previewImage : undefined,
    previewImageAlt:
      typeof data.previewImageAlt === "string"
        ? data.previewImageAlt
        : undefined,
    equipment: typeof data.equipment === "string" ? data.equipment : undefined,
    difficulty: parseDifficulty(data.difficulty),
  };
}

function parseDifficulty(
  value: unknown
): StyrkeoevelserDifficulty | undefined {
  if (value === "begynder" || value === "oevet" || value === "avanceret") {
    return value;
  }
  return undefined;
}

const hubGuidePath = path.join(contentRoot, "hub-guide.md");
const hubFooterPath = path.join(contentRoot, "hub-footer.md");

export function getStyrkeoevelserHubGuideContent(): string | null {
  if (!fs.existsSync(hubGuidePath)) {
    return null;
  }
  const raw = fs.readFileSync(hubGuidePath, "utf-8");
  const { content: body } = matter(raw);
  return processMarkdownImages(body);
}

export function getStyrkeoevelserHubFooterContent(): string | null {
  if (!fs.existsSync(hubFooterPath)) {
    return null;
  }
  const raw = fs.readFileSync(hubFooterPath, "utf-8");
  const { content: body } = matter(raw);
  return processMarkdownImages(body);
}

/** Hub section grid: alle øvelser der matcher mindst én af `matchSlugs`, sorteret A–Å (da). */
export function pickExercisesForHubSection(matchSlugs: string[]): Array<{
  slug: string;
  title: string;
  description: string;
  bodyParts: string[];
  previewImage?: string;
  previewImageAlt?: string;
  equipment?: string;
  difficulty?: StyrkeoevelserDifficulty;
}> {
  const all = getAllExercisesList();
  return all
    .filter((ex) => ex.bodyParts.some((bp) => matchSlugs.includes(bp)))
    .sort((a, b) => a.title.localeCompare(b.title, "da"));
}

export function getAllBodyPartsList(): Array<{
  slug: string;
  title: string;
  description: string;
}> {
  return getBodyPartSlugs()
    .map((slug) => {
      const bp = getBodyPart(slug);
      return { slug: bp.slug, title: bp.title, description: bp.description };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "da"));
}

export function getAllExercisesList(): Array<{
  slug: string;
  title: string;
  description: string;
  bodyParts: string[];
  previewImage?: string;
  previewImageAlt?: string;
  equipment?: string;
  difficulty?: StyrkeoevelserDifficulty;
}> {
  return getExerciseSlugs()
    .map((slug) => {
      const ex = getExercise(slug);
      return {
        slug: ex.slug,
        title: ex.title,
        description: ex.description,
        bodyParts: ex.bodyParts,
        previewImage: ex.previewImage,
        previewImageAlt: ex.previewImageAlt,
        equipment: ex.equipment,
        difficulty: ex.difficulty,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "da"));
}

export function getExercisesForBodyPart(bodyPartSlug: string) {
  return getAllExercisesList().filter((ex) =>
    ex.bodyParts.includes(bodyPartSlug)
  );
}

export function getRelatedExercises(
  currentSlug: string,
  bodyParts: string[],
  limit = 6
) {
  if (bodyParts.length === 0) {
    return [];
  }
  const related = getAllExercisesList()
    .filter(
      (ex) =>
        ex.slug !== currentSlug &&
        ex.bodyParts.some((p) => bodyParts.includes(p))
    )
    .sort((a, b) => a.title.localeCompare(b.title, "da"));

  return related.slice(0, limit);
}

/**
 * Extra keywords for body-part pages when the hub copy uses a plural/inflected
 * form that does not match the short `title` (e.g. title "Arm" vs text "arme").
 * On `/styrkeoevelser/*`, these must beat ordbog synonyms for the same words.
 */
const BODY_PART_LINK_KEYWORD_EXTRAS: Record<string, string[]> = {
  arm: ["arme", "Arme", "armene", "Armene"],
};

/** Keywords for internal auto-linking (sync; used from loadLinkConfig). */
export function getStyrkeoevelserLinkMappings(): LinkMapping[] {
  const mappings: LinkMapping[] = [];

  for (const slug of getBodyPartSlugs()) {
    const bp = getBodyPart(slug);
    const keywords = linkKeywordsFromTitle(bp.title, BODY_PART_LINK_KEYWORD_EXTRAS[slug]);
    mappings.push({
      keywords,
      destination: `${STYRKEOEVELSER_PATH}/${slug}`,
    });
  }

  for (const slug of getExerciseSlugs()) {
    const ex = getExercise(slug);
    const keywords = linkKeywordsFromTitle(ex.title);
    mappings.push({
      keywords,
      destination: `${STYRKEOEVELSER_PATH}/${slug}`,
    });
  }

  return mappings;
}

function linkKeywordsFromTitle(
  title: string,
  extras: string[] = []
): string[] {
  const trimmed = title.trim();
  if (!trimmed && extras.length === 0) {
    return [];
  }
  const variants = new Set<string>();
  if (trimmed) {
    const lower = trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
    const upper = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    variants.add(trimmed);
    variants.add(lower);
    variants.add(upper);
  }
  for (const extra of extras) {
    const t = extra.trim();
    if (t) {
      variants.add(t);
    }
  }
  return Array.from(variants);
}

export function getBodyPartTitleBySlug(slug: string): string {
  return getBodyPart(slug).title;
}

/** Lowercases first character for mid-sentence Danish (e.g. «Se alle arme øvelser»). */
export const bodyPartPhraseInSentence = (title: string): string => {
  const t = title.trim();
  if (!t) {
    return t;
  }
  return t.charAt(0).toLocaleLowerCase("da-DK") + t.slice(1);
};

/** Absolute URL for assets under `public/` or already-absolute URLs. */
export const toAbsoluteSiteUrl = (pathOrUrl: string): string => {
  const t = pathOrUrl.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) {
    return t;
  }
  const path = t.startsWith("/") ? t : `/${t}`;
  return `${STYRKEOEVELSER_SITE_URL}${path}`;
};
