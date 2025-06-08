// Configuration Tester
// Validate source configurations and test CSV parsing

import * as fs from "fs";
import * as path from "path";

interface SourceConfig {
  source_name: string;
  source_type: string;
  description: string;
  expected_columns: string[];
  required_columns: string[];
  matching_strategy: any;
  actions: any;
  validation_rules: any;
  notes: string;
}

async function main() {
  const args = process.argv.slice(2);
  let configName = "";

  for (const arg of args) {
    if (arg.startsWith("--config=")) {
      configName = arg.split("=")[1];
    }
  }

  if (!configName) {
    console.error("Usage: npm run config:test -- --config=parkinsons");
    console.error("\nAvailable configurations:");

    // List available configs
    const configDir = path.join(process.cwd(), "scripts", "config", "sources");
    if (fs.existsSync(configDir)) {
      const files = fs
        .readdirSync(configDir)
        .filter((file) => file.endsWith(".json") && file !== "template.json")
        .map((file) => file.replace(".json", ""));

      files.forEach((file) => console.error(`  - ${file}`));
    }

    process.exit(1);
  }

  console.log(`🧪 Testing configuration: ${configName}`);

  // Load configuration
  const configPath = path.join(
    process.cwd(),
    "scripts",
    "config",
    "sources",
    `${configName}.json`
  );

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Configuration file not found: ${configPath}`);
    process.exit(1);
  }

  let config: SourceConfig;
  try {
    const configContent = fs.readFileSync(configPath, "utf-8");
    config = JSON.parse(configContent);
  } catch (error) {
    console.error(`❌ Failed to parse configuration: ${error}`);
    process.exit(1);
  }

  // Validate configuration structure
  console.log("\n📋 Configuration Validation:");

  const requiredFields = [
    "source_name",
    "source_type",
    "expected_columns",
    "required_columns",
  ];
  let isValid = true;

  for (const field of requiredFields) {
    if (!config[field as keyof SourceConfig]) {
      console.log(`❌ Missing required field: ${field}`);
      isValid = false;
    } else {
      console.log(
        `✅ ${field}: ${JSON.stringify(config[field as keyof SourceConfig])}`
      );
    }
  }

  // Validate source_type
  const validTypes = ["specialty_list", "clinic_update", "new_clinics"];
  if (!validTypes.includes(config.source_type)) {
    console.log(
      `❌ Invalid source_type: ${
        config.source_type
      }. Must be one of: ${validTypes.join(", ")}`
    );
    isValid = false;
  }

  // Validate required columns are subset of expected columns
  const missingRequired = config.required_columns.filter(
    (col) => !config.expected_columns.includes(col)
  );
  if (missingRequired.length > 0) {
    console.log(
      `❌ Required columns not in expected columns: ${missingRequired.join(
        ", "
      )}`
    );
    isValid = false;
  }

  // Check if klinikNavn is required (it should be)
  if (!config.required_columns.includes("klinikNavn")) {
    console.log(
      `⚠️  Warning: klinikNavn is not in required_columns. This is usually needed for matching.`
    );
  }

  console.log("\n🎯 Configuration Summary:");
  console.log(`   Source: ${config.source_name}`);
  console.log(`   Type: ${config.source_type}`);
  console.log(`   Expected columns: ${config.expected_columns.length}`);
  console.log(`   Required columns: ${config.required_columns.length}`);
  console.log(
    `   Specialties to add: ${config.actions?.add_specialties?.length || 0}`
  );

  if (isValid) {
    console.log("\n✅ Configuration is valid!");
    console.log("\n📝 You can now use it with:");
    console.log(
      `npm run import:enhanced -- --file=data.csv --source=${configName}`
    );
  } else {
    console.log("\n❌ Configuration has errors. Please fix them before using.");
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Configuration test failed:", error);
    process.exit(1);
  });
}
