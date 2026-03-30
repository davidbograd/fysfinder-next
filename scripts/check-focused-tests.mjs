// Added: 2026-03-30 - Prevent committing focused/skipped tests in CI.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "src");
const testFilePattern = /\.(test|spec)\.(ts|tsx|js|jsx)$/;
const focusedPattern = /\.(only|skip)\(/;

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }
    if (testFilePattern.test(entry.name)) files.push(fullPath);
  }
  return files;
}

async function main() {
  const files = await collectFiles(srcDir);
  const violations = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      if (focusedPattern.test(line)) {
        violations.push(`${path.relative(root, file)}:${index + 1}:${line.trim()}`);
      }
    });
  }

  if (violations.length > 0) {
    console.error("Found focused/skipped tests:");
    violations.forEach((line) => console.error(line));
    process.exit(1);
  }

  console.log("No focused/skipped tests found.");
}

await main();
