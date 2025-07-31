#!/usr/bin/env tsx

/**
 * Manual Logo Upload Script
 *
 * Allows you to manually upload and map clinic logos
 * Usage: npm run upload:logo <domain-or-website> <logo-file-path>
 *
 * Examples:
 * npm run upload:logo fysiopuls.dk ./my-logos/fysiopuls-logo.png
 * npm run upload:logo "https://www.klinikexempel.dk" ./logos/klinik-logo.jpg
 */

import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Types
interface LogoCache {
  [domain: string]: {
    status: "success" | "failed" | "pending";
    logoPath?: string;
    lastChecked: string;
    attempts: number;
  };
}

// Configuration
const LOGO_DIR = "public/logos";
const CACHE_FILE = "public/logos/cache.json";

function extractDomain(website: string): string | null {
  if (!website) return null;

  try {
    // Remove protocol if present
    let domain = website.replace(/^https?:\/\//, "");
    // Remove www. if present
    domain = domain.replace(/^www\./, "");
    // Remove trailing slash and path
    domain = domain.split("/")[0];
    // Remove port if present
    domain = domain.split(":")[0];

    return domain.toLowerCase();
  } catch (error) {
    return null;
  }
}

async function loadCache(): Promise<LogoCache> {
  try {
    const cacheData = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(cacheData);
  } catch (error) {
    console.log("📝 Creating new cache file...");
    return {};
  }
}

async function saveCache(cache: LogoCache): Promise<void> {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function copyAndOptimizeLogo(
  sourcePath: string,
  targetPath: string
): Promise<void> {
  // Ensure the logos directory exists
  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  // Copy the file
  await fs.copyFile(sourcePath, targetPath);

  console.log(`📁 Copied logo to: ${targetPath}`);
}

function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.log(`
🎨 Manual Logo Upload Tool

Usage: npm run upload:logo <domain-or-website> <logo-file-path>

Examples:
  npm run upload:logo fysiopuls.dk ./my-logos/fysiopuls-logo.png
  npm run upload:logo "https://www.klinikexempel.dk" ./logos/klinik-logo.jpg
  npm run upload:logo kliniknavnet.dk ~/Downloads/new-logo.svg

Supported formats: PNG, JPG, JPEG, SVG, WEBP
`);
    process.exit(1);
  }

  const [websiteInput, logoPath] = args;

  // Extract domain from input
  const domain = extractDomain(websiteInput);
  if (!domain) {
    console.error("❌ Invalid domain/website format");
    process.exit(1);
  }

  // Check if source file exists
  try {
    await fs.access(logoPath);
  } catch (error) {
    console.error(`❌ Logo file not found: ${logoPath}`);
    process.exit(1);
  }

  // Get file extension and create target filename
  const ext = getFileExtension(logoPath);
  const supportedFormats = [".png", ".jpg", ".jpeg", ".svg", ".webp"];

  if (!supportedFormats.includes(ext)) {
    console.error(`❌ Unsupported format: ${ext}`);
    console.error(`Supported formats: ${supportedFormats.join(", ")}`);
    process.exit(1);
  }

  // For consistency with the automated system, convert everything to PNG naming
  const targetFilename = `${domain}.png`;
  const targetPath = path.join(LOGO_DIR, targetFilename);

  try {
    console.log(`🚀 Uploading logo for domain: ${domain}`);
    console.log(`📂 Source: ${logoPath}`);
    console.log(`📁 Target: ${targetPath}`);

    // Load current cache
    const cache = await loadCache();

    // Check if logo already exists
    if (cache[domain]?.status === "success") {
      console.log(`⚠️  Logo already exists for ${domain}`);
      console.log("🔄 Overwriting existing logo...");
    }

    // Copy the logo file
    await copyAndOptimizeLogo(logoPath, targetPath);

    // Update cache
    cache[domain] = {
      status: "success",
      logoPath: `/logos/${targetFilename}`,
      lastChecked: new Date().toISOString(),
      attempts: 1,
    };

    await saveCache(cache);

    console.log(`✅ Logo successfully uploaded for ${domain}!`);
    console.log(`🔗 Logo path: /logos/${targetFilename}`);
    console.log(`📊 Cache updated`);
  } catch (error) {
    console.error(
      "💥 Error uploading logo:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main();
