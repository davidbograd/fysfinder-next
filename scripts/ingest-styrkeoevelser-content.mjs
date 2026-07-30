#!/usr/bin/env node
/**
 * Ingest styrkeøvelser content (body parts + exercises) from two CSV exports.
 *
 * Usage:
 *   node scripts/ingest-styrkeoevelser-content.mjs <bodyPartsCsv> <exercisesCsv>
 *
 * The CSVs are the source of truth: body-part pages and exercise pages that are
 * not present in the CSVs are deleted, and matching ones are overwritten with
 * the CSV content. Metadata the CSV does not carry (equipment, difficulty,
 * preview image, video) is intentionally left out.
 */
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import matter from "gray-matter";

const [, , bodyPartsCsvArg, exercisesCsvArg] = process.argv;

const bodyPartsCsv =
  bodyPartsCsvArg ??
  "/Users/davidbogradprivate/Downloads/SEO content - Øvelsesunivers - body part + exercises - Body part pages.csv";
const exercisesCsv =
  exercisesCsvArg ??
  "/Users/davidbogradprivate/Downloads/SEO content - Øvelsesunivers - body part + exercises - Exercise pages.csv";

const contentRoot = path.join(process.cwd(), "src/content/styrkeoevelser");
const kropsdeleDir = path.join(contentRoot, "kropsdele");
const ovelserDir = path.join(contentRoot, "ovelser");

const TODAY = "13/06/2026";

/** Short, display titles for the 14 body-part pages (used for H1, breadcrumbs, card pills). */
const BODY_PART_TITLES = {
  knae: "Knæ",
  hofte: "Hofte",
  ankel: "Ankel",
  fod: "Fod",
  laend: "Lænd",
  ryg: "Ryg",
  nakke: "Nakke",
  skulder: "Skulder",
  bryst: "Bryst",
  albue: "Albue",
  haandled: "Håndled",
  arm: "Arm",
  ben: "Ben",
  mave: "Mave",
};

// Mirror of src/app/utils/slugify.ts (kept in sync intentionally for ingestion).
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/ü/g, "u")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "-")
    .replace(/\-\-+/g, "-")
    .trim();
}

/**
 * The CSV exports prefix most lines with a single leading space and start each
 * cell with an H1. Strip the uniform 1-space indent (there is no real nesting)
 * and remove the leading H1 (the page renders the title separately). Returns
 * the cleaned body and the H1 text (used as the exercise title).
 */
function cleanContent(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n").map((l) => (l.startsWith(" ") ? l.slice(1) : l));

  let h1 = null;
  while (lines.length && lines[0].trim() === "") {
    lines.shift();
  }
  if (lines.length && /^#\s+/.test(lines[0])) {
    h1 = lines[0].replace(/^#\s+/, "").trim();
    lines.shift();
  }
  while (lines.length && lines[0].trim() === "") {
    lines.shift();
  }
  while (lines.length && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  return { body: lines.join("\n") + "\n", h1 };
}

function readCsv(file) {
  const parsed = Papa.parse(fs.readFileSync(file, "utf-8"), {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data;
}

function clearDir(dir, keepSlugs) {
  const removed = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const slug = f.replace(/\.md$/, "");
    if (!keepSlugs.has(slug)) {
      fs.unlinkSync(path.join(dir, f));
      removed.push(slug);
    }
  }
  return removed;
}

function writeFile(dir, slug, frontmatter, body) {
  const file = matter.stringify(`\n${body}`, frontmatter);
  fs.writeFileSync(path.join(dir, `${slug}.md`), file, "utf-8");
}

// ---- Body parts ----
const bpRows = readCsv(bodyPartsCsv).filter((r) => (r.Slug || "").trim());
const bpSlugs = new Set(bpRows.map((r) => r.Slug.trim()));

for (const slug of bpSlugs) {
  if (!BODY_PART_TITLES[slug]) {
    throw new Error(`No display title configured for body-part slug "${slug}"`);
  }
}

const removedBodyParts = clearDir(kropsdeleDir, bpSlugs);

for (const row of bpRows) {
  const slug = row.Slug.trim();
  const { body } = cleanContent(row.Content || "");
  const frontmatter = {
    title: BODY_PART_TITLES[slug],
    metaTitle: (row["Meta title"] || "").trim() || undefined,
    datePublished: TODAY,
    lastUpdated: TODAY,
  };
  if (!frontmatter.metaTitle) delete frontmatter.metaTitle;
  writeFile(kropsdeleDir, slug, frontmatter, body);
}

// ---- Exercises ----
const exRows = readCsv(exercisesCsv).filter((r) => (r.slug || "").trim());
const exSlugs = new Set(exRows.map((r) => r.slug.trim()));

if (exSlugs.size !== exRows.length) {
  throw new Error("Duplicate exercise slugs detected in CSV");
}
for (const slug of exSlugs) {
  if (bpSlugs.has(slug)) {
    throw new Error(`Slug collision: "${slug}" is both an exercise and a body part`);
  }
}

const removedExercises = clearDir(ovelserDir, exSlugs);

const unknownBodyParts = new Set();
for (const row of exRows) {
  const slug = row.slug.trim();
  const { body, h1 } = cleanContent(row.content || "");
  const bodyParts = (row.body_part || "")
    .split(";")
    .map((s) => slugify(s.trim()))
    .filter(Boolean);
  for (const bp of bodyParts) {
    if (!bpSlugs.has(bp)) unknownBodyParts.add(`${slug}: ${bp}`);
  }
  // The CSV uses the literal instruction "same as h1" for every exercise meta
  // title, i.e. there is no custom SEO title. Drop it so the page falls back to
  // its branded default (`<title> – styrkeøvelse | Fysfinder`).
  const rawMeta = (row.meta_title || "").trim();
  const metaTitle =
    rawMeta && rawMeta.toLowerCase() !== "same as h1" ? rawMeta : undefined;
  const frontmatter = {
    title: h1 || slug,
    bodyParts,
    metaTitle,
    datePublished: TODAY,
    lastUpdated: TODAY,
  };
  if (!frontmatter.metaTitle) delete frontmatter.metaTitle;
  writeFile(ovelserDir, slug, frontmatter, body);
}

console.log(`Body parts: wrote ${bpRows.length}, removed [${removedBodyParts.join(", ")}]`);
console.log(`Exercises: wrote ${exRows.length}, removed ${removedExercises.length} [${removedExercises.join(", ")}]`);
if (unknownBodyParts.size) {
  console.warn(`\nWARNING: exercise body parts not matching a body-part page:`);
  for (const u of unknownBodyParts) console.warn("  - " + u);
} else {
  console.log("All exercise body-part tags map to a valid body-part page.");
}
