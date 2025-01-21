import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { writeFileSync } from "fs";
import path from "path";

function generateSQL() {
  try {
    // Get absolute path to CSV file
    const csvPath = path.join(
      process.cwd(),
      "public",
      "Byer - SEO tekster.csv"
    );
    console.log("Looking for CSV file at:", csvPath);

    // Read the CSV file
    const fileContent = readFileSync(csvPath, "utf-8");
    console.log("Successfully read CSV file");

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    console.log("Total number of records:", records.length);

    // Split records into chunks
    const chunkSize = Math.ceil(records.length / 6);
    const chunks = [];

    for (let i = 0; i < records.length; i += chunkSize) {
      chunks.push(records.slice(i, i + chunkSize));
    }

    // Generate SQL file for each chunk
    chunks.forEach((chunk, index) => {
      let sql = `UPDATE cities 
SET seo_tekst = subquery.seo_tekst
FROM (
  VALUES\n`;

      const values = chunk
        .map((record: any) => {
          const escapedText = record.seo_tekst
            .replace(/'/g, "''")
            .replace(/\r\n/g, "\n")
            .replace(/\n/g, "\\n");

          return `    ('${record.bynavn}', E'${escapedText}')`;
        })
        .join(",\n");

      sql += values;

      sql += `
) AS subquery(bynavn, seo_tekst)
WHERE cities.bynavn = subquery.bynavn;`;

      // Write to numbered SQL files
      const sqlPath = path.join(
        process.cwd(),
        "scripts",
        `update-seo-text-${index + 1}.sql`
      );
      writeFileSync(sqlPath, sql);
      console.log(`SQL file ${index + 1} generated at:`, sqlPath);
      console.log(`Contains ${chunk.length} records`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

generateSQL();
