#!/usr/bin/env node
/**
 * Generate SEO preview images for styrkeøvelser via Leonardo.ai (Nano Banana 2).
 *
 * Usage:
 *   LEONARDO_API_KEY=... node scripts/generate-styrkeoevelser-images.mjs
 *   LEONARDO_API_KEY=... node scripts/generate-styrkeoevelser-images.mjs --slugs plank,squat,bench-press
 *   LEONARDO_API_KEY=... node scripts/generate-styrkeoevelser-images.mjs --limit 3
 *   LEONARDO_API_KEY=... node scripts/generate-styrkeoevelser-images.mjs --dry-run
 *   LEONARDO_API_KEY=... node scripts/generate-styrkeoevelser-images.mjs --prompt-title squat="Barbell squat"
 *   LEONARDO_API_KEY=... node scripts/generate-styrkeoevelser-images.mjs --prompt-titles 'squat=Barbell squat,chin-ups=Chin ups'
 *
 * Requires LEONARDO_API_KEY (or loads from .env.local).
 * --prompt-title / --prompt-titles override only the title in buildPrompt;
 * frontmatter title and alt text still use the real MD exercise title.
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const API_BASE = "https://cloud.leonardo.ai/api/rest";
const MODEL = "nano-banana-2";
const STYLE_DYNAMIC = "111dc692-d470-4eec-b791-3475abac4c46";
const WIDTH = 1024;
const HEIGHT = 1024;
const QUANTITY = 1;
const POLL_MS = 4000;
const POLL_TIMEOUT_MS = 180_000;
const REQUEST_GAP_MS = 1500;

/** Danish labels for SEO alt text. */
const BODY_PART_TITLES_DA = {
  knae: "knæ",
  hofte: "hofte",
  ankel: "ankel",
  fod: "fod",
  laend: "lænd",
  ryg: "ryg",
  nakke: "nakke",
  skulder: "skulder",
  bryst: "bryst",
  albue: "albue",
  haandled: "håndled",
  arm: "arme",
  ben: "ben",
  mave: "mave",
};

/** English labels for Leonardo prompts (model follows English cues more reliably). */
const BODY_PART_TITLES_EN = {
  knae: "knees",
  hofte: "hips",
  ankel: "ankles",
  fod: "feet",
  laend: "lower back",
  ryg: "back",
  nakke: "neck",
  skulder: "shoulders",
  bryst: "chest",
  albue: "elbows",
  haandled: "wrists",
  arm: "arms",
  ben: "legs",
  mave: "abdominal muscles",
};

const ovelserDir = path.join(
  process.cwd(),
  "src/content/styrkeoevelser/ovelser"
);
const imageOutDir = path.join(
  process.cwd(),
  "public/images/styrkeoevelser/ovelser"
);
const statusPath = path.join(
  process.cwd(),
  "scripts/.styrkeoevelser-image-status.json"
);

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

/**
 * Parse "slug=Name" pairs. Name may contain commas when using repeatable
 * --prompt-title; for --prompt-titles, pairs are comma-separated so names
 * must not contain unescaped commas.
 */
function parsePromptTitlePair(pair) {
  const eq = pair.indexOf("=");
  if (eq === -1) {
    throw new Error(
      `Invalid prompt title override "${pair}" (expected slug=Name)`
    );
  }
  const slug = pair.slice(0, eq).trim();
  const name = pair.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!slug || !name) {
    throw new Error(
      `Invalid prompt title override "${pair}" (expected slug=Name)`
    );
  }
  return [slug, name];
}

function parseArgs(argv) {
  const args = {
    slugs: null,
    limit: null,
    dryRun: false,
    force: false,
    promptTitles: {},
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--force") args.force = true;
    else if (a === "--limit") {
      args.limit = Number(argv[++i]);
    } else if (a.startsWith("--limit=")) {
      args.limit = Number(a.split("=")[1]);
    } else if (a === "--slugs") {
      args.slugs = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    } else if (a.startsWith("--slugs=")) {
      args.slugs = a
        .slice("--slugs=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (a === "--prompt-title") {
      const [slug, name] = parsePromptTitlePair(argv[++i] ?? "");
      args.promptTitles[slug] = name;
    } else if (a.startsWith("--prompt-title=")) {
      const [slug, name] = parsePromptTitlePair(a.slice("--prompt-title=".length));
      args.promptTitles[slug] = name;
    } else if (a === "--prompt-titles") {
      const raw = argv[++i] ?? "";
      for (const pair of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
        const [slug, name] = parsePromptTitlePair(pair);
        args.promptTitles[slug] = name;
      }
    } else if (a.startsWith("--prompt-titles=")) {
      const raw = a.slice("--prompt-titles=".length);
      for (const pair of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
        const [slug, name] = parsePromptTitlePair(pair);
        args.promptTitles[slug] = name;
      }
    }
  }
  return args;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Deterministic gender from slug so reruns stay consistent. */
function genderForSlug(slug) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash % 2 === 0 ? "man" : "woman";
}

function genderDa(gender) {
  return gender === "woman" ? "Kvinde" : "Mand";
}

function genderEn(gender) {
  return gender === "woman" ? "woman" : "man";
}

function extractHowToSteps(content, maxSteps = 4) {
  const match = content.match(
    /##[^\n]*Sådan gør du[^\n]*\n([\s\S]*?)(?=\n## |\n\*\*Antal|$)/i
  );
  if (!match) return [];
  const steps = [];
  for (const line of match[1].split("\n")) {
    const m = line.match(/^\d+\.\s+(.+)/);
    if (m) {
      steps.push(m[1].trim().replace(/\.$/, ""));
      if (steps.length >= maxSteps) break;
    }
  }
  return steps;
}

function joinLabels(labels, { andWord }) {
  if (labels.length === 0) return null;
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} ${andWord} ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} ${andWord} ${labels[labels.length - 1]}`;
}

function bodyPartLabelDa(bodyParts) {
  return joinLabels(
    (bodyParts ?? [])
      .map((slug) => BODY_PART_TITLES_DA[slug] ?? slug)
      .filter(Boolean),
    { andWord: "og" }
  );
}

function bodyPartLabelEn(bodyParts) {
  return joinLabels(
    (bodyParts ?? [])
      .map((slug) => BODY_PART_TITLES_EN[slug] ?? slug)
      .filter(Boolean),
    { andWord: "and" }
  );
}

/**
 * Build a unique "Exercise instructions" block from the article's how-to steps.
 * Not too heavy: we already parse "Sådan gør du"; joining 3–4 steps gives each
 * exercise a concrete pose without hand-writing 122 prompts.
 */
function buildExerciseInstructions(steps) {
  if (!steps.length) {
    return "Perform the exercise with technically correct form at a clear mid-repetition or static hold.";
  }
  return steps.map((s) => (s.endsWith(".") ? s : `${s}.`)).join(" ");
}

function buildPrompt({ title, gender, steps, bodyParts }) {
  const person = genderEn(gender);
  const instructions = buildExerciseInstructions(steps);
  const focus = bodyPartLabelEn(bodyParts);
  const focusLine = focus
    ? `Emphasize technically correct form for training the ${focus}.`
    : "Emphasize technically correct form.";

  return [
    `Photorealistic photograph of exactly one ${person} performing **${title}**, frozen in a single correct mid-repetition or static hold position.`,
    ``,
    `Exercise instructions: ${instructions}`,
    ``,
    `Athletic build, fitted neutral-colored sportswear, natural skin texture. Correct anatomical positioning and realistic body proportions.`,
    ``,
    `Modern, bright, completely empty gym interior with dark flooring and light walls. Large windows provide soft natural daylight. Only the exercising ${person} is visible. No other people, trainers, gym users, silhouettes, reflections, photographs of people, or people visible through windows or mirrors.`,
    ``,
    `Shot on a 50mm lens from a side three-quarter angle. Full body completely within frame, including the head, hands, and feet. Sharp focus, high detail, clean modern editorial fitness photography.`,
    ``,
    `Single static pose. No motion sequence, duplicate limbs, multiple poses, text, labels, logos, branding, or watermarks.`,
    ``,
    focusLine,
  ].join("\n");
}

function buildAlt({ title, gender, bodyParts }) {
  const person = genderDa(gender);
  const focus = bodyPartLabelDa(bodyParts);
  if (focus) {
    return `${person} laver ${title} – styrkeøvelse til ${focus}`;
  }
  return `${person} laver ${title} – styrkeøvelse`;
}

function imageFileName(slug) {
  return `${slug}-styrkeoevelse.jpg`;
}

function publicImagePath(slug) {
  return `/images/styrkeoevelser/ovelser/${imageFileName(slug)}`;
}

function loadStatus() {
  if (!fs.existsSync(statusPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(statusPath, "utf8"));
  } catch {
    return {};
  }
}

function saveStatus(status) {
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2) + "\n");
}

function listExercises() {
  return fs
    .readdirSync(ovelserDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

function readExercise(slug) {
  const filePath = path.join(ovelserDir, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { filePath, data, content, raw };
}

function writeFrontmatter(filePath, data, content) {
  const next = matter.stringify(content.trimStart(), data);
  fs.writeFileSync(filePath, next.endsWith("\n") ? next : next + "\n");
}

async function leonardoGenerate(apiKey, prompt) {
  const res = await fetch(`${API_BASE}/v2/generations`, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      parameters: {
        width: WIDTH,
        height: HEIGHT,
        prompt,
        quantity: QUANTITY,
        style_ids: [STYLE_DYNAMIC],
        prompt_enhance: "OFF",
      },
      public: false,
    }),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Leonardo generate non-JSON (${res.status}): ${text.slice(0, 400)}`);
  }
  if (!res.ok) {
    throw new Error(
      `Leonardo generate failed (${res.status}): ${JSON.stringify(json).slice(0, 600)}`
    );
  }

  const generationId =
    json?.generate?.generationId ??
    json?.generationId ??
    json?.sdGenerationJob?.generationId;

  if (!generationId) {
    throw new Error(
      `No generationId in response: ${JSON.stringify(json).slice(0, 600)}`
    );
  }
  return generationId;
}

async function leonardoPoll(apiKey, generationId) {
  const started = Date.now();
  while (Date.now() - started < POLL_TIMEOUT_MS) {
    const res = await fetch(`${API_BASE}/v1/generations/${generationId}`, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${apiKey}`,
      },
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Leonardo poll non-JSON (${res.status}): ${text.slice(0, 400)}`);
    }
    if (!res.ok) {
      throw new Error(
        `Leonardo poll failed (${res.status}): ${JSON.stringify(json).slice(0, 600)}`
      );
    }

    const gen = json?.generations_by_pk ?? json?.generation ?? json;
    const status = gen?.status;
    const images = gen?.generated_images ?? gen?.images ?? [];

    if (status === "COMPLETE" || status === "COMPLETED" || images.length > 0) {
      const url = images[0]?.url ?? images[0]?.image?.url;
      if (!url) {
        throw new Error(
          `Complete but no image URL: ${JSON.stringify(json).slice(0, 600)}`
        );
      }
      return { url, imageId: images[0]?.id, raw: json };
    }

    if (status === "FAILED" || status === "FAILED") {
      throw new Error(`Generation failed: ${JSON.stringify(json).slice(0, 600)}`);
    }

    await sleep(POLL_MS);
  }
  throw new Error(`Timed out waiting for generation ${generationId}`);
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}) for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
}

async function main() {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.LEONARDO_API_KEY;

  if (!apiKey && !args.dryRun) {
    console.error("Missing LEONARDO_API_KEY (set env or add to .env.local).");
    process.exit(1);
  }

  fs.mkdirSync(imageOutDir, { recursive: true });

  let slugs = listExercises();
  if (args.slugs?.length) {
    const missing = args.slugs.filter((s) => !slugs.includes(s));
    if (missing.length) {
      console.error(`Unknown slugs: ${missing.join(", ")}`);
      process.exit(1);
    }
    slugs = args.slugs;
  }
  if (args.limit != null && Number.isFinite(args.limit)) {
    slugs = slugs.slice(0, args.limit);
  }

  const status = loadStatus();
  console.log(
    `Generating images for ${slugs.length} exercise(s)` +
      (args.dryRun ? " [dry-run]" : "") +
      ` → ${imageOutDir}`
  );

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const slug of slugs) {
    const outName = imageFileName(slug);
    const outPath = path.join(imageOutDir, outName);
    const { filePath, data, content } = readExercise(slug);
    const title = typeof data.title === "string" ? data.title : slug;
    const promptTitle = args.promptTitles[slug] ?? title;
    const bodyParts = Array.isArray(data.bodyParts) ? data.bodyParts : [];
    const gender = genderForSlug(slug);
    const steps = extractHowToSteps(content, 4);
    const prompt = buildPrompt({ title: promptTitle, gender, steps, bodyParts });
    const alt = buildAlt({ title, gender, bodyParts });
    const previewImage = publicImagePath(slug);

    const alreadyHasFile = fs.existsSync(outPath);
    const alreadyWired =
      data.previewImage === previewImage && data.previewImageAlt === alt;

    if (!args.force && alreadyHasFile && alreadyWired) {
      console.log(`SKIP  ${slug} (already has image + frontmatter)`);
      skipped++;
      continue;
    }

    console.log(`\n→ ${slug} (${genderEn(gender)})`);
    console.log(`  file: ${outName}`);
    console.log(`  alt:  ${alt}`);
    if (promptTitle !== title) {
      console.log(`  prompt title override: ${promptTitle}`);
    }
    const instructionLine =
      prompt.split("\n").find((l) => l.startsWith("Exercise instructions:")) ??
      "";
    console.log(`  ${instructionLine.slice(0, 220)}${instructionLine.length > 220 ? "…" : ""}`);

    if (args.dryRun) {
      ok++;
      continue;
    }

    try {
      if (args.force || !alreadyHasFile) {
        const generationId = await leonardoGenerate(apiKey, prompt);
        console.log(`  generationId: ${generationId}`);
        const { url, imageId } = await leonardoPoll(apiKey, generationId);
        await downloadImage(url, outPath);
        console.log(`  saved: ${outPath}`);
        status[slug] = {
          generationId,
          imageId,
          url,
          file: previewImage,
          alt,
          gender: genderEn(gender),
          updatedAt: new Date().toISOString(),
        };
        saveStatus(status);
      } else {
        console.log(`  reuse existing file, updating frontmatter only`);
      }

      data.previewImage = previewImage;
      data.previewImageAlt = alt;
      writeFrontmatter(filePath, data, content);
      console.log(`  frontmatter updated`);
      ok++;
    } catch (err) {
      failed++;
      console.error(`  FAIL ${slug}: ${err.message}`);
      status[slug] = {
        ...(status[slug] ?? {}),
        error: err.message,
        failedAt: new Date().toISOString(),
      };
      saveStatus(status);
    }

    await sleep(REQUEST_GAP_MS);
  }

  console.log(
    `\nDone. ok=${ok} skipped=${skipped} failed=${failed} (of ${slugs.length})`
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
