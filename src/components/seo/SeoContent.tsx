// SeoContent component - Renders MDX content with internal linking and consistent prose styling
// Extracted from location page to eliminate duplicated prose classes and MDX rendering logic

import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { loadLinkConfig } from "lib/internal-linking/config";
import rehypeInternalLinks from "lib/internal-linking/rehype-internal-links";

interface SeoContentProps {
  source: string;
  currentPagePath: string;
}

export function SeoContent({ source, currentPagePath }: SeoContentProps) {
  const linkConfig = loadLinkConfig();

  return (
    <div
      className="mt-12 prose prose-slate max-w-none
        prose-headings:text-gray-900
        prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:mt-8
        prose-h3:text-xl prose-h3:font-medium prose-h3:mb-3 prose-h3:mt-6
        prose-p:text-gray-600 prose-p:mb-4 prose-p:leading-relaxed
        prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:text-gray-600
        prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:text-gray-600
        prose-li:mb-2 prose-li:leading-relaxed
        prose-strong:font-semibold prose-strong:text-gray-900
        prose-a:text-logo-blue prose-a:no-underline hover:prose-a:underline
        prose-table:w-full prose-table:border-collapse prose-table:mt-4
        prose-th:bg-logo-blue prose-th:text-white prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:border
        prose-td:px-4 prose-td:py-2 prose-td:border
        [&>*:first-child]:mt-0
        [&>*:last-child]:mb-0"
    >
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              [rehypeInternalLinks, { linkConfig, currentPagePath }],
            ] as any[],
          },
        }}
      />
    </div>
  );
}
