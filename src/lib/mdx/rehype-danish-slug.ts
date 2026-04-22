import type { Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import { slugify } from "@/app/utils/slugify";

// Drop-in replacement for `rehype-slug` that generates heading `id`s with the
// project's Danish-aware `slugify` (transliterates æ→ae, ø→oe, å→aa, ü→u).
// Keeping all heading id generation in one function is what lets TableOfContents
// (which uses the same `slugify` in extractTableOfContents) actually find and
// scroll to the matching heading, including for Danish-language headings.
const HEADING_TAG = /^h[1-6]$/;

const rehypeDanishSlug: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node) => {
    if (!HEADING_TAG.test(node.tagName)) return;

    const properties = node.properties ?? (node.properties = {});
    if (properties.id) return;

    const text = toString(node);
    if (!text) return;

    properties.id = slugify(text);
  });
};

export default rehypeDanishSlug;
