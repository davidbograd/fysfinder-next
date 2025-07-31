#!/usr/bin/env tsx

/**
 * Build-time script to fetch and cache clinic logos
 *
 * Features:
 * - Incremental: Only fetches new/missing logos
 * - Caching: Tracks success/failure to avoid re-fetching
 * - Fast: Parallel processing with rate limiting
 * - Resilient: Handles failures gracefully
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
// @ts-ignore
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Types
interface LogoCache {
  [domain: string]: {
    status: "success" | "failed" | "pending";
    logoPath?: string;
    lastChecked: number;
    attempts: number;
  };
}

interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  website: string;
}

// Configuration
const LOGO_DIR = "public/logos";
const CACHE_FILE = "public/logos/cache.json";
const API_TOKEN = process.env.LOGO_DEV_API_TOKEN || "pk_YiqSJOVUStasZ4yEls7iTw";
const MAX_ATTEMPTS = 3;
const RETRY_AFTER_DAYS = 90;
const CONCURRENT_REQUESTS = 5;

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  console.log(
    "💡 Make sure you have a .env.local file with your Supabase credentials"
  );
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable"
  );
  console.log(
    "💡 Make sure you have a .env.local file with your Supabase credentials"
  );
  process.exit(1);
}

if (!process.env.LOGO_DEV_API_TOKEN) {
  console.log("ℹ️  Using fallback Logo.dev API token");
  console.log(
    "💡 For production, add LOGO_DEV_API_TOKEN to your .env.local file"
  );
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Utility functions
function extractDomain(url: string): string | null {
  try {
    const domain = url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
    return domain;
  } catch {
    return null;
  }
}

function sanitizeFilename(domain: string): string {
  return domain.replace(/[^a-zA-Z0-9.-]/g, "_");
}

async function loadCache(): Promise<LogoCache> {
  try {
    const cacheData = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(cacheData);
  } catch {
    return {};
  }
}

async function saveCache(cache: LogoCache): Promise<void> {
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function fetchLogo(
  domain: string
): Promise<{ success: boolean; data?: Buffer }> {
  const url = `https://img.logo.dev/${domain}?token=${API_TOKEN}&size=64&format=png&fallback=404`;

  try {
    const response = await fetch(url, { timeout: 10000 });

    if (
      response.ok &&
      response.headers.get("content-type")?.includes("image")
    ) {
      const buffer = await response.buffer();
      return { success: true, data: buffer };
    }

    return { success: false };
  } catch (error) {
    console.warn(
      `Failed to fetch logo for ${domain}:`,
      error instanceof Error ? error.message : String(error)
    );
    return { success: false };
  }
}

async function processLogo(domain: string, cache: LogoCache): Promise<void> {
  const now = Date.now();
  const cacheEntry = cache[domain];

  // Skip if recently checked and failed/succeeded
  if (cacheEntry) {
    const daysSinceCheck =
      (now - cacheEntry.lastChecked) / (1000 * 60 * 60 * 24);

    if (cacheEntry.status === "success") {
      // Verify the actual image file exists
      const filename = `${sanitizeFilename(domain)}.png`;
      const logoPath = path.join(LOGO_DIR, filename);

      try {
        await fs.access(logoPath);
        console.log(`✓ Skipping ${domain} (already cached)`);
        return;
      } catch {
        console.log(
          `🔄 Re-fetching ${domain} (cache says success but file missing)`
        );
        // Continue to fetch since file is missing
      }
    }

    if (
      cacheEntry.status === "failed" &&
      cacheEntry.attempts >= MAX_ATTEMPTS &&
      daysSinceCheck < RETRY_AFTER_DAYS
    ) {
      console.log(
        `⏭ Skipping ${domain} (failed recently, retry in ${Math.ceil(
          RETRY_AFTER_DAYS - daysSinceCheck
        )} days)`
      );
      return;
    }
  }

  console.log(`🔄 Fetching logo for ${domain}...`);

  const result = await fetchLogo(domain);

  if (result.success && result.data) {
    // Save logo to file
    const filename = `${sanitizeFilename(domain)}.png`;
    const logoPath = path.join(LOGO_DIR, filename);

    await fs.mkdir(LOGO_DIR, { recursive: true });
    await fs.writeFile(logoPath, result.data);

    // Update cache
    cache[domain] = {
      status: "success",
      logoPath: `/logos/${filename}`,
      lastChecked: now,
      attempts: (cacheEntry?.attempts || 0) + 1,
    };

    console.log(`✅ Saved logo for ${domain}`);
  } else {
    // Update cache with failure
    cache[domain] = {
      status: "failed",
      lastChecked: now,
      attempts: (cacheEntry?.attempts || 0) + 1,
    };

    console.log(`❌ No logo found for ${domain}`);
  }
}

async function processBatch(
  domains: string[],
  cache: LogoCache
): Promise<void> {
  const promises = domains.map((domain) => processLogo(domain, cache));
  await Promise.all(promises);
}

async function main(): Promise<void> {
  console.log("🚀 Starting logo fetch process...");

  try {
    // Load existing cache
    const cache = await loadCache();
    console.log(`📋 Loaded cache with ${Object.keys(cache).length} entries`);

    // Fetch all clinics with websites
    const { data: clinics, error } = await supabase
      .from("clinics")
      .select("clinics_id, klinikNavn, website")
      .not("website", "is", null)
      .neq("website", "");

    if (error) {
      throw new Error(`Failed to fetch clinics: ${error.message}`);
    }

    if (!clinics || clinics.length === 0) {
      console.log("ℹ️ No clinics with websites found");
      return;
    }

    console.log(`📊 Found ${clinics.length} clinics with websites`);

    // Extract unique domains
    const domains = new Set<string>();
    for (const clinic of clinics) {
      const domain = extractDomain(clinic.website);
      if (domain) {
        domains.add(domain);
      }
    }

    const uniqueDomains = Array.from(domains);
    console.log(`🌐 Processing ${uniqueDomains.length} unique domains`);

    // Process domains in batches
    for (let i = 0; i < uniqueDomains.length; i += CONCURRENT_REQUESTS) {
      const batch = uniqueDomains.slice(i, i + CONCURRENT_REQUESTS);
      await processBatch(batch, cache);

      // Save cache after each batch
      await saveCache(cache);

      // Small delay to be respectful to the API
      if (i + CONCURRENT_REQUESTS < uniqueDomains.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Final save
    await saveCache(cache);

    const successCount = Object.values(cache).filter(
      (entry) => entry.status === "success"
    ).length;
    const failedCount = Object.values(cache).filter(
      (entry) => entry.status === "failed"
    ).length;

    console.log(`\n✨ Logo fetch complete!`);
    console.log(`✅ Success: ${successCount} logos`);
    console.log(`❌ Failed: ${failedCount} domains`);
    console.log(`📁 Cache file: ${CACHE_FILE}`);
  } catch (error) {
    console.error(
      "💥 Error during logo fetch:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Run the script
main();
