// Added: 2026-09-07 - Minimal inline-markup parser for symptom-universe copy so content data can carry crawlable links and bold runs without an MDX pipeline.

import type { RichText } from "./types";

export type RichTextToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "link"; label: string; href: string };

/** `[label](/href)` or `**bold**`. Hrefs may not contain whitespace. */
const INLINE_PATTERN = /\[([^\]]+)\]\((\S+?)\)|\*\*([^*]+)\*\*/g;

/**
 * Splits a rich-text string into plain text, bold and link tokens. Unmatched
 * brackets and asterisks are kept as literal text.
 */
export function parseRichText(input: RichText): RichTextToken[] {
  const tokens: RichTextToken[] = [];
  let lastIndex = 0;

  // `matchAll` needs the global flag, which `INLINE_PATTERN` carries; reset the
  // shared regex state by iterating a fresh matcher each call.
  for (const match of input.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ type: "text", value: input.slice(lastIndex, index) });
    }

    const [full, linkLabel, linkHref, boldValue] = match;
    if (linkLabel && linkHref) {
      tokens.push({ type: "link", label: linkLabel, href: linkHref });
    } else if (boldValue) {
      tokens.push({ type: "bold", value: boldValue });
    }

    lastIndex = index + full.length;
  }

  if (lastIndex < input.length) {
    tokens.push({ type: "text", value: input.slice(lastIndex) });
  }

  return tokens;
}

/** Strips inline markup, e.g. for meta descriptions and JSON-LD. */
export function richTextToPlainText(input: RichText): string {
  return parseRichText(input)
    .map((token) => (token.type === "link" ? token.label : token.value))
    .join("");
}

/** Every href referenced by a rich-text string. */
export function extractRichTextHrefs(input: RichText): string[] {
  return parseRichText(input)
    .filter((token): token is Extract<RichTextToken, { type: "link" }> =>
      token.type === "link"
    )
    .map((token) => token.href);
}
