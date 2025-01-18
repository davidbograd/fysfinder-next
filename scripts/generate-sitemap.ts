import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import glob from "glob-promise";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DOMAIN = "https://www.fysfinder.dk";
const LAST_MOD = new Date().toISOString();

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
    // Fetch data from Supabase
    const { data: cities } = await supabase.from("cities").select("*");
    const { data: specialties } = await supabase
      .from("specialties")
      .select("*");
    const { data: clinics } = await supabase.from("clinics").select("*");

    // Get article files
    const articleFiles = await glob("src/content/glossary/*.md");
    const articles = articleFiles.map((file) => path.basename(file, ".md"));

    // Generate URLs for each content type
    const staticUrls = [
      {
        loc: DOMAIN,
        priority: 1.0,
      },
    ];

    const cityUrls =
      cities?.map((city) => ({
        loc: `${DOMAIN}/find/fysioterapeut/${city.slug}`,
        priority: 0.8,
      })) || [];

    const specialtyUrls =
      cities?.flatMap(
        (city) =>
          specialties?.map((specialty) => ({
            loc: `${DOMAIN}/find/fysioterapeut/${city.slug}/${specialty.slug}`,
            priority: 0.6,
          })) || []
      ) || [];

    const clinicUrls =
      clinics?.map((clinic) => ({
        loc: `${DOMAIN}/klinik/${clinic.slug}`,
        priority: 0.7,
      })) || [];

    const articleUrls = articles.map((article) => ({
      loc: `${DOMAIN}/fysioterapeut-artikler/${article}`,
      priority: 0.6,
    }));

    // Generate sitemap files
    await fs.writeFile(
      "public/sitemap-static.xml",
      await generateSitemapXML(staticUrls)
    );

    await fs.writeFile(
      "public/sitemap-cities.xml",
      await generateSitemapXML(cityUrls)
    );

    await fs.writeFile(
      "public/sitemap-specialties.xml",
      await generateSitemapXML(specialtyUrls)
    );

    await fs.writeFile(
      "public/sitemap-clinics.xml",
      await generateSitemapXML(clinicUrls)
    );

    await fs.writeFile(
      "public/sitemap-articles.xml",
      await generateSitemapXML(articleUrls)
    );

    // Generate sitemap index
    const sitemapFiles = [
      "sitemap-static.xml",
      "sitemap-cities.xml",
      "sitemap-specialties.xml",
      "sitemap-clinics.xml",
      "sitemap-articles.xml",
    ];

    await fs.writeFile(
      "public/sitemap.xml",
      await generateSitemapIndex(sitemapFiles)
    );

    console.log("Sitemaps generated successfully!");
  } catch (error) {
    console.error("Error generating sitemaps:", error);
  }
}

generateSitemaps();
