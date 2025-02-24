const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

function slugify(text: string): string {
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

interface MetaTitle {
  "Søgeord / artikel title": string;
  "Meta title": string;
}

function generateSlugifiedMetaTitles() {
  try {
    // Read the CSV file
    const csvPath = path.join(
      process.cwd(),
      "public",
      "metatitler first round.csv"
    );
    const fileContent = fs.readFileSync(csvPath, "utf-8");

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as MetaTitle[];

    // Add slugified filename column
    const enhancedRecords = records.map((record) => ({
      ...record,
      Filename: `${slugify(record["Søgeord / artikel title"])}.md`,
    }));

    // Generate new CSV content
    const output = stringify(enhancedRecords, {
      header: true,
      columns: ["Søgeord / artikel title", "Meta title", "Filename"],
    });

    // Write to new file
    const outputPath = path.join(
      process.cwd(),
      "public",
      "metatitler-with-slugs.csv"
    );
    fs.writeFileSync(outputPath, output);

    console.log(`Generated CSV with slugified filenames at: ${outputPath}`);
    console.log(`Total records processed: ${enhancedRecords.length}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

generateSlugifiedMetaTitles();
