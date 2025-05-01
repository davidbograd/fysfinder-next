import * as fs from "fs";
import * as path from "path";

interface LinkMapping {
  keywords: string[];
  destination: string;
}

interface CityData {
  name: string;
  designation: string | null;
  slug: string;
}

// Helper function to read and parse CSV
// Note: This is a basic parser assuming simple CSV structure without escaped commas or quotes within fields.
function parseCsv<T>(
  filePath: string,
  mapFn: (headers: string[], values: string[]) => T
): T[] {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: CSV file not found at ${absolutePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(absolutePath, "utf-8");
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    return []; // Empty or header-only file
  }
  const headers = lines[0].split(",").map((h) => h.trim());
  const data: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple split, might break if commas are within quotes
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length === headers.length) {
      try {
        const mapped = mapFn(headers, values);
        data.push(mapped);
      } catch (error) {
        console.warn(`Skipping row ${i + 1} due to mapping error:`, error);
      }
    } else {
      console.warn(
        `Skipping row ${i + 1}: Expected ${headers.length} columns, found ${
          values.length
        }`
      );
    }
  }
  return data;
}

// --- Configuration ---
const cityCsvPath = "data/byer may 2025.csv";
// Removed specialtyCsvPath as it's no longer needed
const outputPath = "data/generated-city-link-mappings.json"; // Changed output filename
// ---------------------

console.log("Reading city data...");
const cities = parseCsv<CityData>(cityCsvPath, (headers, values) => {
  const bynavnIndex = headers.indexOf("bynavn");
  const betegnelseIndex = headers.indexOf("betegnelse");
  const slugIndex = headers.indexOf("bynavn_slug");
  if (bynavnIndex === -1 || slugIndex === -1) {
    // Added check for slugIndex being potentially missing but required
    console.error(
      "Error: CSV file must contain 'bynavn' and 'bynavn_slug' columns."
    );
    process.exit(1);
  }

  return {
    name: values[bynavnIndex],
    // Handle empty designation column
    designation:
      betegnelseIndex !== -1 && values[betegnelseIndex]
        ? values[betegnelseIndex]
        : null,
    slug: values[slugIndex],
  };
});
console.log(`Read ${cities.length} cities.`);

// Removed specialty reading logic

const cityMappings: LinkMapping[] = [];

// Generate City-only links
console.log("Generating city-only links...");
cities.forEach((city) => {
  const keywords: string[] = [];
  const cityNames = [city.name];
  // Add designation as a potential name if it exists and is different
  if (city.designation && city.designation !== city.name) {
    cityNames.push(city.designation);
  }

  cityNames.forEach((name) => {
    if (!name) return; // Skip if name is somehow empty
    keywords.push(`Fysioterapeut ${name}`);
    keywords.push(`${name} fysioterapeut`);
    keywords.push(`Fysioterapi ${name}`);
    keywords.push(`${name} fysioterapi`);
  });

  // Ensure we have a valid slug and some keywords before adding
  if (keywords.length > 0 && city.slug) {
    cityMappings.push({
      keywords: Array.from(new Set(keywords)), // Ensure unique keywords & TS compatibility
      destination: `/find/fysioterapeut/${city.slug}`,
    });
  }
});

console.log(`Generated a total of ${cityMappings.length} city link mappings.`);

// Removed specialty-only and combined link generation logic

// Write to JSON file
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(cityMappings, null, 2), "utf-8");
console.log(`Successfully wrote city mappings to ${outputPath}`);
