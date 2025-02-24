const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const matter = require("gray-matter");

interface MetaTitleRecord {
  "Søgeord / artikel title": string;
  "Meta title": string;
  Filename: string;
}

async function updateMetaTitles() {
  try {
    // Read the CSV file
    const csvPath = path.join(
      process.cwd(),
      "public",
      "metatitler-with-slugs.csv"
    );
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    }) as MetaTitleRecord[];

    // Create a map of filename to meta title for easier lookup
    const metaTitleMap = new Map(
      records.map((record) => [record.Filename, record["Meta title"]])
    );

    // Directory containing markdown files
    const ordbogDir = path.join(process.cwd(), "src", "content", "ordbog");
    const files = fs.readdirSync(ordbogDir);

    const results = {
      successful: [] as string[],
      failed: [] as string[],
      notFound: [] as string[],
    };

    // Process each markdown file
    for (const filename of files) {
      try {
        const metaTitle = metaTitleMap.get(filename);

        if (!metaTitle) {
          results.notFound.push(filename);
          continue;
        }

        const filePath = path.join(ordbogDir, filename);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);

        // Add metaTitle to frontmatter
        const newData = {
          ...data,
          metaTitle,
        };

        // Create new file content with updated frontmatter
        const newContent = matter.stringify(content, newData);

        // Write back to file
        fs.writeFileSync(filePath, newContent);
        results.successful.push(filename);
      } catch (error) {
        results.failed.push(filename);
        console.error(`Error processing ${filename}:`, error);
      }
    }

    // Log results
    console.log("\nResults:");
    console.log("=========");
    console.log(`\nSuccessfully updated (${results.successful.length}):`);
    results.successful.forEach((file) => console.log(`✓ ${file}`));

    if (results.failed.length > 0) {
      console.log(`\nFailed to update (${results.failed.length}):`);
      results.failed.forEach((file) => console.log(`✗ ${file}`));
    }

    if (results.notFound.length > 0) {
      console.log(`\nNo meta title found (${results.notFound.length}):`);
      results.notFound.forEach((file) => console.log(`? ${file}`));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

updateMetaTitles();
