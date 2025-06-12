// Configuration Creator
// Helper script to create new source configurations

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("🛠️  Creating new source configuration...\n");

  // Get basic information
  const sourceName = await askQuestion(
    'Source name (e.g., "ms_association"): '
  );
  const description = await askQuestion("Description: ");
  const sourceType = await askQuestion(
    "Source type (specialty_list/clinic_update/new_clinics): "
  );

  // Get expected columns
  console.log("\n📋 Expected CSV columns (use exact Supabase column names):");
  console.log(
    "Common columns: klinikNavn, adresse, postnummer, tlf, email, website, handicapadgang"
  );
  const columnsInput = await askQuestion("Enter columns (comma-separated): ");
  const expectedColumns = columnsInput.split(",").map((col) => col.trim());

  // Get required columns
  const requiredInput = await askQuestion(
    "Required columns (comma-separated, default: klinikNavn): "
  );
  const requiredColumns = requiredInput || "klinikNavn";

  // Get specialties to add
  const specialtiesInput = await askQuestion(
    "Specialties to add (comma-separated, optional): "
  );
  const specialties = specialtiesInput
    ? specialtiesInput.split(",").map((s) => s.trim())
    : [];

  // Get fields to set
  console.log("\n🏷️  Fields to set for all clinics (optional):");
  const setFieldsInput = await askQuestion(
    "Format: field=value,field2=value2 (optional): "
  );
  const setFields: any = {};
  if (setFieldsInput) {
    setFieldsInput.split(",").forEach((pair) => {
      const [key, value] = pair.split("=").map((s) => s.trim());
      if (key && value) {
        setFields[key] = value;
      }
    });
  }

  // Create configuration object
  const config = {
    source_name: sourceName,
    source_type: sourceType,
    description: description,

    expected_columns: expectedColumns,
    required_columns: requiredColumns.split(",").map((col) => col.trim()),

    matching_strategy: {
      primary: "exact_name_postal",
      confidence_threshold: 0.8,
      review_threshold: 0.4,
    },

    actions: {
      add_specialties: specialties,
      set_fields: setFields,
      tags: [`${sourceName}_${new Date().getFullYear()}`],
    },

    validation_rules: {
      postnummer_format: "^\\d{4}$",
      required_if_present: ["adresse"],
    },

    notes: `Configuration for ${description}`,
  };

  // Save configuration file
  const configPath = path.join(
    process.cwd(),
    "scripts",
    "config",
    "sources",
    `${sourceName}.json`
  );
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`\n✅ Configuration created: ${configPath}`);
  console.log("\n📝 You can now use it with:");
  console.log(
    `npm run import:enhanced -- --file=data.csv --source=${sourceName}`
  );

  rl.close();
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Failed to create configuration:", error);
    process.exit(1);
  });
}
