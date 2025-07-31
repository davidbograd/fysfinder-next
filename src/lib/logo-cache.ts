/**
 * Logo cache utilities for loading cached clinic logos
 */

interface LogoCache {
  [domain: string]: {
    status: "success" | "failed" | "pending";
    logoPath?: string;
    lastChecked: number;
    attempts: number;
  };
}

let logoCache: LogoCache | null = null;

/**
 * Extract domain from website URL
 */
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

/**
 * Load logo cache from static file
 */
async function loadLogoCache(): Promise<LogoCache> {
  if (logoCache !== null) {
    return logoCache as LogoCache;
  }

  try {
    // In browser/production, fetch from public directory
    if (typeof window !== "undefined") {
      const response = await fetch("/logos/cache.json");
      if (response.ok) {
        const data = await response.json();
        logoCache = data || {};
        return logoCache as LogoCache;
      }
    } else {
      // In Node.js/build time, read from file system
      const fs = await import("fs/promises");
      const path = await import("path");

      const cacheFile = path.join(process.cwd(), "public/logos/cache.json");
      const cacheData = await fs.readFile(cacheFile, "utf-8");
      const data = JSON.parse(cacheData);
      logoCache = data || {};
      return logoCache as LogoCache;
    }
  } catch (error) {
    console.warn("Failed to load logo cache:", error);
  }

  // Return empty cache if loading fails
  logoCache = {};
  return logoCache as LogoCache;
}

/**
 * Get cached logo path for a website URL
 * Returns local path if available, null if no logo or failed
 */
export async function getCachedLogoPath(
  website: string
): Promise<string | null> {
  const domain = extractDomain(website);
  if (!domain) return null;

  const cache = await loadLogoCache();
  const entry = cache[domain];

  if (entry && entry.status === "success" && entry.logoPath) {
    return entry.logoPath;
  }

  return null;
}

/**
 * Check if a domain has been processed (success or failed)
 */
export async function isDomainProcessed(website: string): Promise<boolean> {
  const domain = extractDomain(website);
  if (!domain) return false;

  const cache = await loadLogoCache();
  return domain in cache;
}

/**
 * Get logo cache statistics
 */
export async function getLogoCacheStats(): Promise<{
  total: number;
  successful: number;
  failed: number;
}> {
  const cache = await loadLogoCache();
  const entries = Object.values(cache);

  return {
    total: entries.length,
    successful: entries.filter((entry) => entry.status === "success").length,
    failed: entries.filter((entry) => entry.status === "failed").length,
  };
}

/**
 * Synchronous version for use in components (assumes cache is already loaded)
 */
export function getCachedLogoPathSync(website: string): string | null {
  const domain = extractDomain(website);
  if (!domain || !logoCache) return null;

  const entry = logoCache[domain];
  if (entry && entry.status === "success" && entry.logoPath) {
    return entry.logoPath;
  }

  return null;
}
