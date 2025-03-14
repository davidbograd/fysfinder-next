import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import glob from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const importMappings = {
  // Layout components
  "@/app/components/Header": "@/components/layout/Header",
  "@/app/components/Footer": "@/components/layout/Footer",
  "@/app/components/Breadcrumbs": "@/components/layout/Breadcrumbs",
  "@/app/components/CookieConsent": "@/components/layout/CookieConsent",

  // Feature components - Clinic
  "@/app/components/ClinicCard": "@/components/features/clinic/ClinicCard",
  "@/app/components/ClinicsList": "@/components/features/clinic/ClinicsList",
  "@/app/components/ClinicSidebar":
    "@/components/features/clinic/ClinicSidebar",

  // Feature components - Specialty
  "@/app/components/SpecialtiesList":
    "@/components/features/specialty/SpecialtiesList",
  "@/app/components/SpecialtyDropdown":
    "@/components/features/specialty/SpecialtyDropdown",
  "@/components/SpecialtiesList":
    "@/components/features/specialty/SpecialtiesList",

  // Feature components - Search
  "@/app/components/SearchAndFilters":
    "@/components/features/search/SearchAndFilters",
  "@/app/components/RegionList": "@/components/features/search/RegionList",

  // Feature components - Team
  "@/app/components/FounderCard": "@/components/features/team/FounderCard",
  "@/app/components/MeetTheTeam": "@/components/features/team/MeetTheTeam",

  // Feature components - Content
  "@/components/GlossaryList": "@/components/features/content/GlossaryList",
  "@/components/GlossaryEntry": "@/components/features/content/GlossaryEntry",
  "@/components/TableOfContents":
    "@/components/features/content/TableOfContents",
  "@/components/FAQ": "@/components/features/content/FAQ",
  "@/components/AuthorCard": "@/components/features/content/AuthorCard",
  "@/app/components/BenefitsSection": "@/components/features/content/BenefitsSection",

  // Feature components - Map
  "@/app/components/GoogleMap": "@/components/features/map/GoogleMap",

  // SEO components
  "@/app/components/SpecialtyStructuredData":
    "@/components/seo/SpecialtyStructuredData",
  "@/app/components/AboutUsStructuredData":
    "@/components/seo/AboutUsStructuredData",
  "@/app/components/SuburbStructuredData":
    "@/components/seo/SuburbStructuredData",
};

async function updateImports() {
  try {
    // Find all TypeScript and TSX files
    const files = await new Promise((resolve, reject) => {
      glob("src/**/*.{ts,tsx}", (err, matches) => {
        if (err) reject(err);
        else resolve(matches);
      });
    });

    for (const file of files) {
      let content = await fs.readFile(file, "utf8");
      let hasChanges = false;

      // Update imports
      for (const [oldPath, newPath] of Object.entries(importMappings)) {
        const regex = new RegExp(`from ["']${oldPath}["']`, "g");
        if (regex.test(content)) {
          content = content.replace(regex, `from '${newPath}'`);
          hasChanges = true;
          console.log(`Updated import in ${file}: ${oldPath} -> ${newPath}`);
        }
      }

      // Save changes if any were made
      if (hasChanges) {
        await fs.writeFile(file, content, "utf8");
      }
    }

    console.log("Import paths updated successfully!");
  } catch (error) {
    console.error("Error updating imports:", error);
  }
}

updateImports();
