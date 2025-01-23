import * as fs from "fs";
import { parse } from "csv-parse/sync";
import * as path from "path";

interface SpecialtyRecord {
  specialty_name: string;
  specialty_name_slug: string;
  seo_text: string;
}

function generateSpecialtySeoSQL() {
  try {
    // Get absolute path to CSV file
    const csvPath = path.join(
      process.cwd(),
      "public",
      "specialer - seo text.csv"
    );
    console.log("Looking for CSV file at:", csvPath);

    // Read the CSV file
    const fileContent = fs.readFileSync(csvPath, "utf-8");
    console.log("Successfully read CSV file");

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as SpecialtyRecord[];
    console.log("Total number of specialty records:", records.length);

    let sql = `-- Update specialty SEO text
UPDATE specialties 
SET seo_tekst = subquery.seo_tekst
FROM (
  VALUES\n`;

    const values = records
      .map((record: SpecialtyRecord) => {
        const escapedText = record.seo_text
          .replace(/'/g, "''")
          .replace(/\r\n/g, "\n")
          .replace(/\n/g, "\\n");

        return `    ('${record.specialty_name_slug}', E'${escapedText}')`;
      })
      .join(",\n");

    sql += values;

    sql += `
) AS subquery(specialty_name_slug, seo_tekst)
WHERE specialties.specialty_name_slug = subquery.specialty_name_slug;`;

    // Write to SQL file
    const sqlPath = path.join(
      process.cwd(),
      "scripts",
      "update-specialty-seo.sql"
    );
    fs.writeFileSync(sqlPath, sql);
    console.log(`SQL file generated at:`, sqlPath);
    console.log(`Contains ${records.length} specialty records`);
  } catch (error) {
    console.error("Error:", error);
  }
}

generateSpecialtySeoSQL();
