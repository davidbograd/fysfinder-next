import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { slugify } from "../src/app/utils/slugify";

interface ArticleRecord {
  title: string;
  content: string;
  metaTitle: string;
}

interface ProcessingResults {
  created: string[];
  skipped: string[];
  errors: Array<{ file: string; error: string }>;
}

function extractH1FromContent(content: string): {
  title: string | null;
  remainingContent: string;
} {
  const lines = content.split("\n");
  const h1Line = lines.find((line) => line.trim().startsWith("# "));

  if (!h1Line) {
    return { title: null, remainingContent: content };
  }

  const title = h1Line.replace("# ", "").trim();
  const remainingContent = lines
    .filter((line) => line !== h1Line) // Remove H1 line
    .join("\n")
    .trim(); // Trim any extra whitespace

  return { title, remainingContent };
}

async function processArticles() {
  const results: ProcessingResults = {
    created: [],
    skipped: [],
    errors: [],
  };

  try {
    // Read the CSV file
    const csvPath = path.join(
      process.cwd(),
      "public",
      "nye ordbog tekster.csv"
    );
    const csvContent = fs.readFileSync(csvPath, "utf-8");

    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    }) as ArticleRecord[];

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), "src", "content", "ordbog");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process each record
    for (const record of records) {
      try {
        // Generate filename
        const filename = `${slugify(record.title)}.md`;
        const filePath = path.join(outputDir, filename);

        // Check if file already exists
        if (fs.existsSync(filePath)) {
          results.skipped.push(filename);
          continue;
        }

        // Extract H1 and clean content
        const { title, remainingContent } = extractH1FromContent(
          record.content
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
title: "${title}"
lastUpdated: "24/02/2024"
metaTitle: "${record.metaTitle}"
---

${remainingContent}`;

        // Write file
        fs.writeFileSync(filePath, fileContent);
        results.created.push(filename);
      } catch (error) {
        results.errors.push({
          file: slugify(record.title) + ".md",
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
