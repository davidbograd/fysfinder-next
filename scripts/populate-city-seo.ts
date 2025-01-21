import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function populateSeoContent() {
  // Read all markdown files from the cities directory
  const citiesDir = path.join(process.cwd(), "src/app/content/cities");
  const files = readdirSync(citiesDir).filter((file) => file.endsWith(".md"));

  for (const file of files) {
    const content = readFileSync(path.join(citiesDir, file), "utf-8");
    const citySlug = file.replace(".md", "");

    const { error } = await supabase
      .from("cities")
      .update({ seo_content: content })
      .eq("bynavn_slug", citySlug);

    if (error) console.error(`Error updating ${citySlug}:`, error);
    else console.log(`Updated ${citySlug}`);
  }
}

populateSeoContent();
