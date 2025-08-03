// HOW TO USE
// 1. Update the CSV file with the new articles
const CSV_FILENAME = "ordbog-ingest-20250803.csv"; // Update this to the new CSV filename
// 2. Update the date below to current date
const CURRENT_DATE = "03/08/2025"; // Update this date when running the script
// 3. Run the script
// node scripts/ordbog/ingest-ordbog-articles.mjs


import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractH1FromContent(content) {
  const lines = content.split("\n");
  const h1Line = lines.find((line) => line.trim().startsWith("# "));

  if (!h1Line) {
    return { title: null, remainingContent: content };
  }

  const title = h1Line.replace("# ", "").trim();
  const remainingContent = lines
    .filter((line) => line !== h1Line)
    .join("\n")
    .trim();

  return { title, remainingContent };
}

async function processArticles() {
  const results = {
    created: [],
    skipped: [],
    errors: [],
  };

  try {
    // Read the CSV file
    const csvPath = path.join(
      process.cwd(),
      "scripts/ordbog/ordbog-ingest-data",
      CSV_FILENAME
    );
    const csvContent = fs.readFileSync(csvPath, "utf-8");

    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), "src", "content", "ordbog");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process each record
    for (const record of records) {
      try {
        // Generate filename
        const filename = `${slugify(record.H1)}.md`;
        const filePath = path.join(outputDir, filename);

        // Check if file already exists
        if (fs.existsSync(filePath)) {
          results.skipped.push(filename);
          continue;
        }

        // Extract H1 and clean content
        const { title, remainingContent } = extractH1FromContent(
          record.Content
        );

        // Validate H1 exists
        if (!title) {
          results.errors.push({
            file: filename,
            error: "No H1 (# Title) found in content",
          });
          continue;
        }

        // Create frontmatter and content
        const fileContent = `---
title: "${title.replace(/"/g, '\\"')}"
lastUpdated: "${CURRENT_DATE}"
metaTitle: "${record["Meta title"].replace(/"/g, '\\"')}"
datePublished: "${CURRENT_DATE}"
---

${remainingContent}`;

        // Write file
        fs.writeFileSync(filePath, fileContent);
        results.created.push(filename);
      } catch (error) {
        results.errors.push({
          file: slugify(record.H1) + ".md",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Log results
    console.log("\nArticle Ingestion Results:");
    console.log("========================\n");

    if (results.created.length > 0) {
      console.log("✅ Created Files:", results.created.length);
      results.created.forEach((file) => console.log(`   ${file}`));
    }

    if (results.skipped.length > 0) {
      console.log("\n⏭️  Skipped (Already Exist):", results.skipped.length);
      results.skipped.forEach((file) => console.log(`   ${file}`));
    }

    if (results.errors.length > 0) {
      console.log("\n❌ Errors:", results.errors.length);
      results.errors.forEach(({ file, error }) =>
        console.log(`   ${file}: ${error}`)
      );
    }
  } catch (error) {
    console.error("Fatal error:", error);
  }
}

processArticles(); 