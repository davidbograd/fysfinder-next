import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypeDanishSlug from "@/lib/mdx/rehype-danish-slug";
import rehypeInternalLinks from "lib/internal-linking/rehype-internal-links";
import { loadLinkConfig } from "lib/internal-linking/config";

// Shared `options` object for `<MDXRemote>` on the tool/scan SEO pages
// (vaerktoejer/*, mr-scanning, dexa-scanning). Centralizing the remark/rehype
// plugin list here means future plugin additions or tweaks are a single-file
// edit instead of 7 identical copy-pastes. Plugin order matters:
//   1. rehypeDanishSlug assigns heading ids used by the page's TableOfContents.
//   2. rehypeUnwrapImages lifts <img> out of the surrounding <p>.
//   3. rehypeInternalLinks auto-links configured terms in body text.
export function buildToolPageMdxOptions(currentPagePath: string) {
  const linkConfig = loadLinkConfig();
  return {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      // Cast mirrors ContentEntry.tsx; without it TS widens the plugin-with-options
      // tuple into a union array and MDXRemote's `Pluggable[]` no longer matches.
      rehypePlugins: [
        rehypeDanishSlug,
        rehypeUnwrapImages,
        [rehypeInternalLinks, { linkConfig, currentPagePath }],
      ] as any[],
    },
  };
}
