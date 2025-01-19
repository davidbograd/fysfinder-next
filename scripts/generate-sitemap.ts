require("dotenv").config({ path: ".env.local" });
const { createClient: supabaseClient } = require("@supabase/supabase-js");
const fsPromises = require("fs/promises");
const pathModule = require("path");
const glob = require("glob-promise");

// Add some debug logging
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

// Initialize Supabase client
const supabaseDb = supabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DOMAIN = "https://www.fysfinder.dk";
const LAST_MOD = new Date().toISOString();

interface City {
  bynavn_slug: string;
}

interface Specialty {
  specialty_name_slug: string;
}

interface Clinic {
  klinikNavnSlug: string;
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
    // Fetch data from Supabase
    const { data: cities } = await supabaseDb.from("cities").select("*");
    const { data: specialties } = await supabaseDb
      .from("specialties")
      .select("*");
    const { data: clinics } = await supabaseDb.from("clinics").select("*");

    // Add debug logging
    console.log("Cities:", cities?.length, cities?.[0]);
    console.log("Specialties:", specialties?.length, specialties?.[0]);
    console.log("Clinics:", clinics?.length, clinics?.[0]);

    // Get article files
    const articleFiles = await glob("src/content/glossary/*.md");
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
    ];

    const cityUrls =
      cities?.map((city: City) => ({
        loc: `${DOMAIN}/find/fysioterapeut/${city.bynavn_slug}`,
        priority: 0.8,
      })) || [];

    const specialtyUrls =
      cities?.flatMap(
        (city: City) =>
          specialties?.map((specialty: Specialty) => ({
            loc: `${DOMAIN}/find/fysioterapeut/${city.bynavn_slug}/${specialty.specialty_name_slug}`,
            priority: 0.6,
          })) || []
      ) || [];

    const clinicUrls =
      clinics?.map((clinic: Clinic) => ({
        loc: `${DOMAIN}/klinik/${clinic.klinikNavnSlug}`,
        priority: 0.7,
      })) || [];

    const articleUrls = articles.map((article: string) => ({
      loc: `${DOMAIN}/fysioterapeut-artikler/${article}`,
      priority: 0.6,
    }));

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
      "public/sitemap-specialties.xml",
      await generateSitemapXML(specialtyUrls)
    );

    await fsPromises.writeFile(
      "public/sitemap-clinics.xml",
      await generateSitemapXML(clinicUrls)
    );

    await fsPromises.writeFile(
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

// At the end, export the function if needed
module.exports = { generateSitemaps };
