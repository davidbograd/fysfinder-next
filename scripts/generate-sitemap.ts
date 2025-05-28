// HOW TO USE
// 1. Run the script "npx tsx scripts/generate-sitemap.ts"
// 2. Push to github

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { promises as fsPromises } from "fs";
import * as pathModule from "path";
import glob from "glob-promise";
import { getBlogPosts } from "../src/lib/blog"; // Import getBlogPosts

config({ path: ".env.local" });

// Initialize Supabase client
const supabaseDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DOMAIN = "https://www.fysfinder.dk";
const LAST_MOD = new Date().toISOString();

interface City {
  id: number;
  bynavn_slug: string;
}

interface Specialty {
  specialty_id: string;
  specialty_name_slug: string;
}

interface Clinic {
  klinikNavnSlug: string;
}

// Helper function to fetch all rows with pagination
async function fetchAllClinics() {
  let allClinics: Clinic[] = [];
  let rangeStart = 0;
  const rangeSize = 1000; // Supabase default limit

  while (true) {
    const { data: clinicsChunk, error } = await supabaseDb
      .from("clinics")
      .select("klinikNavnSlug") // Only select the needed column
      .range(rangeStart, rangeStart + rangeSize - 1);

    if (error) {
      console.error("Error fetching clinics chunk:", error);
      throw error; // Stop execution if there's an error
    }

    if (clinicsChunk) {
      allClinics = allClinics.concat(clinicsChunk);
    }

    if (!clinicsChunk || clinicsChunk.length < rangeSize) {
      break; // Exit loop if last chunk was fetched or an error occurred
    }

    rangeStart += rangeSize;
  }
  console.log(`Fetched a total of ${allClinics.length} clinics.`);
  return allClinics;
}

async function generateSitemapXML(
  urls: Array<{ loc: string; lastmod?: string; priority: number }>
) {
  const urlElements = urls
    .map(
      ({ loc, lastmod = LAST_MOD, priority }) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority.toFixed(2)}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

async function generateSitemapIndex(sitemapFiles: string[]) {
  const sitemaps = sitemapFiles
    .map(
      (file) => `
  <sitemap>
    <loc>${DOMAIN}/${file}</loc>
    <lastmod>${LAST_MOD}</lastmod>
  </sitemap>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
}

async function generateSitemaps() {
  try {
    // Fetch data from Supabase with clinic availability
    const { data: cities } = await supabaseDb.from("cities").select("*");
    const { data: specialties } = await supabaseDb
      .from("specialties")
      .select("*");
    const clinics = await fetchAllClinics();

    // Fetch clinic-specialty relationships with city information
    const { data: clinicSpecialties } = await supabaseDb.from(
      "clinic_specialties"
    ).select(`
        specialty_id,
        clinics_id,
        clinics (
          city_id
        )
      `);

    // Add debug logging for initial data
    console.log("Initial data counts:", {
      cities: cities?.length || 0,
      specialties: specialties?.length || 0,
      clinicSpecialties: clinicSpecialties?.length || 0,
    });

    // Create a map of valid specialty-city combinations
    const validSpecialtyCityPairs = new Set();

    clinicSpecialties?.forEach((cs: any) => {
      if (cs.clinics?.city_id) {
        const pair = `${cs.specialty_id}-${cs.clinics.city_id}`;
        validSpecialtyCityPairs.add(pair);
      }
    });

    // Log a sample of the pairs and total count
    console.log(
      "Valid specialty-city pairs count:",
      validSpecialtyCityPairs.size
    );
    console.log(
      "First few valid pairs:",
      Array.from(validSpecialtyCityPairs).slice(0, 3)
    );

    // Filter specialty-city combinations to only include those with clinics
    const specialtyCityUrls =
      cities?.flatMap(
        (city: City) =>
          specialties?.reduce((acc: any[], specialty: Specialty) => {
            const pairKey = `${specialty.specialty_id}-${city.id}`;
            const isValid = validSpecialtyCityPairs.has(pairKey);

            // Log some sample checks
            if (acc.length < 2) {
              // Only log first few to avoid console spam
              console.log("Checking pair:", {
                pairKey,
                cityId: city.id,
                citySlug: city.bynavn_slug,
                specialtyId: specialty.specialty_id,
                specialtySlug: specialty.specialty_name_slug,
                isValid,
              });
            }

            if (isValid) {
              acc.push({
                loc: `${DOMAIN}/find/fysioterapeut/${city.bynavn_slug}/${specialty.specialty_name_slug}`,
                priority: 0.6,
              });
            }
            return acc;
          }, []) || []
      ) || [];

    // Log final URLs count
    console.log(
      "Generated specialty-city URLs count:",
      specialtyCityUrls.length
    );
    if (specialtyCityUrls.length > 0) {
      console.log("First specialty-city URL:", specialtyCityUrls[0]);
    }

    // Get article files
    const articleFiles = await glob("src/content/ordbog/*.md");
    const articles = articleFiles.map((file: string) =>
      pathModule.basename(file, ".md")
    );

    // Generate URLs for each content type
    const staticUrls = [
      {
        loc: DOMAIN,
        priority: 1.0,
      },
      {
        loc: `${DOMAIN}/om-os`,
        priority: 0.8,
      },
      {
        loc: `${DOMAIN}/samarbejdspartnere`,
        priority: 0.8,
      },
      {
        loc: `${DOMAIN}/ordbog`,
        priority: 0.8,
      },
      {
        loc: `${DOMAIN}/blog`,
        priority: 0.8,
      },
    ];

    const cityUrls =
      cities?.map((city: City) => ({
        loc: `${DOMAIN}/find/fysioterapeut/${city.bynavn_slug}`,
        priority: 0.8,
      })) || [];

    const specialtyCoreUrls =
      specialties?.map((specialty: Specialty) => ({
        loc: `${DOMAIN}/find/fysioterapeut/danmark/${specialty.specialty_name_slug}`,
        priority: 0.7,
      })) || [];

    const clinicUrls =
      clinics?.map((clinic: Clinic) => ({
        loc: `${DOMAIN}/klinik/${clinic.klinikNavnSlug}`,
        priority: 0.7,
      })) || [];

    const articleUrls = articles.map((article: string) => ({
      loc: `${DOMAIN}/ordbog/${article}`,
      priority: 0.6,
    }));

    // Fetch blog post slugs
    const blogPosts = await getBlogPosts();
    const blogPostUrls = blogPosts.map((post) => ({
      loc: `${DOMAIN}/blog/${post.slug}`,
      priority: 0.6, // Assign appropriate priority
    }));

    // Dynamically discover tool URLs
    const toolUrls: Array<{ loc: string; priority: number }> = [];

    // Add main tools overview page
    toolUrls.push({
      loc: `${DOMAIN}/vaerktoejer`,
      priority: 0.8, // Keep main overview page at higher priority
    });

    // Discover tool subpages under /vaerktoejer/
    try {
      const vaerktoejerPath = pathModule.join(
        process.cwd(),
        "src/app/vaerktoejer"
      );
      const vaerktoejerItems = await fsPromises.readdir(vaerktoejerPath, {
        withFileTypes: true,
      });

      for (const item of vaerktoejerItems) {
        if (item.isDirectory()) {
          // Check if the directory has a page.tsx file
          const pagePath = pathModule.join(
            vaerktoejerPath,
            item.name,
            "page.tsx"
          );
          try {
            await fsPromises.access(pagePath);
            toolUrls.push({
              loc: `${DOMAIN}/vaerktoejer/${item.name}`,
              priority: 0.7,
            });
          } catch {
            // Directory doesn't have a page.tsx, skip it
          }
        }
      }
    } catch (error) {
      console.error("Error scanning vaerktoejer directory:", error);
    }

    // Discover standalone tool pages (pages that contain tool-related content)
    const standaloneToolPages = [
      "mr-scanning",
      "dexa-scanning",
      "start-back-screening-tool",
    ];

    for (const toolPage of standaloneToolPages) {
      try {
        const pagePath = pathModule.join(
          process.cwd(),
          "src/app",
          toolPage,
          "page.tsx"
        );
        await fsPromises.access(pagePath);
        toolUrls.push({
          loc: `${DOMAIN}/${toolPage}`,
          priority: 0.7,
        });
      } catch {
        // Page doesn't exist, skip it
        console.warn(`Standalone tool page ${toolPage} not found, skipping`);
      }
    }

    console.log(
      `Found ${toolUrls.length} tool pages:`,
      toolUrls.map((url) => url.loc)
    );

    // Generate sitemap files
    await fsPromises.writeFile(
      "public/sitemap-static.xml",
      await generateSitemapXML(staticUrls)
    );

    await fsPromises.writeFile(
      "public/sitemap-cities.xml",
      await generateSitemapXML(cityUrls)
    );

    await fsPromises.writeFile(
      "public/sitemap-specialties-core.xml",
      await generateSitemapXML(specialtyCoreUrls)
    );

    await fsPromises.writeFile(
      "public/sitemap-specialties-cities.xml",
      await generateSitemapXML(specialtyCityUrls)
    );

    await fsPromises.writeFile(
      "public/sitemap-clinics.xml",
      await generateSitemapXML(clinicUrls)
    );

    await fsPromises.writeFile(
      "public/sitemap-ordbog.xml",
      await generateSitemapXML(articleUrls)
    );

    // Generate sitemap for blog posts
    await fsPromises.writeFile(
      "public/sitemap-blog-posts.xml",
      await generateSitemapXML(blogPostUrls)
    );

    // Generate sitemap for tools
    await fsPromises.writeFile(
      "public/sitemap-vaerktoejer.xml",
      await generateSitemapXML(toolUrls)
    );

    // Update sitemap index
    const sitemapFiles = [
      "sitemap-static.xml",
      "sitemap-cities.xml",
      "sitemap-specialties-core.xml",
      "sitemap-specialties-cities.xml",
      "sitemap-clinics.xml",
      "sitemap-ordbog.xml",
      "sitemap-blog-posts.xml", // Add blog posts sitemap to index
      "sitemap-vaerktoejer.xml", // Add tools sitemap to index
    ];

    await fsPromises.writeFile(
      "public/sitemap.xml",
      await generateSitemapIndex(sitemapFiles)
    );

    console.log("Sitemaps generated successfully!");
  } catch (error) {
    console.error("Error generating sitemaps:", error);
  }
}

generateSitemaps();

// Export as ESM module
export { generateSitemaps };
