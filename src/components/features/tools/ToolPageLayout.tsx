import { ReactNode } from "react";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import RelatedToolsSection from "@/components/features/RelatedToolsSection";
import { TableOfContents } from "@/components/features/blog-og-ordbog/TableOfContents";
import { ToolFeedback } from "@/components/features/tools/ToolFeedback";
import { MdxProseTable } from "@/components/mdx/MdxProseTable";
import VaerktoejerStructuredData from "@/components/seo/VaerktoejerStructuredData";
import { buildToolPageMdxOptions } from "@/lib/mdx/build-tool-page-mdx-options";
import { getContentImageSize } from "@/lib/mdx/content-image-dimensions";
import { MDX_PROSE_TABLE_HEADER_WRAP } from "@/lib/mdx/mdx-prose-table-classnames";
import { getPageContent } from "@/lib/pageContent";
import { getToolRatingStats } from "@/lib/tools/get-tool-rating-stats";
import { getToolBySlug, ToolSlug } from "@/lib/tools/registry";
import {
  PublishedToolRating,
  resolvePublishedToolRating,
} from "@/lib/tools/tool-ratings";
import { extractTableOfContents } from "@/lib/utils";

const PROSE_CLASSES = `prose prose-slate max-w-none
  prose-headings:text-gray-900
  prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:font-semibold prose-h2:mt-12 prose-h2:mb-4
  prose-h3:text-lg prose-h3:sm:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-2
  prose-p:text-gray-700 prose-p:mb-4 prose-p:leading-relaxed
  prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:text-gray-700
  prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:text-gray-700
  prose-li:mb-2 prose-li:leading-relaxed
  prose-strong:font-semibold prose-strong:text-gray-900
  prose-a:text-logo-blue prose-a:no-underline hover:prose-a:underline
  prose-table:w-full prose-table:border-collapse prose-table:mt-4
  prose-th:bg-logo-blue prose-th:text-white prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:border ${MDX_PROSE_TABLE_HEADER_WRAP}
  prose-td:px-4 prose-td:py-2 prose-td:border
  [&>*:first-child]:mt-0
  [&>*:last-child]:mb-0`;

interface MdxImageProps {
  src?: string;
  alt?: string;
}

function buildMdxComponents(fallbackAlt: string) {
  return {
    img: ({ src, alt }: MdxImageProps) => {
      if (!src) return null;

      // Images with known dimensions keep their own aspect ratio, so a
      // portrait infographic is not cropped into a landscape box.
      const size = getContentImageSize(src);
      if (size) {
        return (
          <Image
            src={src}
            alt={alt || fallbackAlt}
            width={size.width}
            height={size.height}
            sizes="(max-width: 768px) 100vw, 768px"
            className="w-full h-auto my-4 sm:my-6 rounded-xl ring-1 ring-black/10"
          />
        );
      }

      return (
        <div className="relative w-full aspect-[16/10] my-4 sm:my-6">
          <Image
            src={src}
            alt={alt || fallbackAlt}
            fill
            className="object-cover rounded-xl ring-1 ring-black/10"
          />
        </div>
      );
    },
    table: MdxProseTable,
  };
}

interface ToolPageLayoutProps {
  slug: ToolSlug;
  heading: string;
  intro: ReactNode;
  /** Tip/disclaimer shown between the calculator and the SEO content. */
  note?: ReactNode;
  structuredDataDescription: string;
  image: { src: string; alt: string };
  /**
   * Receives the published rating so the number in the calculator header is the
   * same one the page marks up in JSON-LD.
   */
  renderCalculator: (rating: PublishedToolRating | null) => ReactNode;
}

export async function ToolPageLayout({
  slug,
  heading,
  intro,
  note,
  structuredDataDescription,
  image,
  renderCalculator,
}: ToolPageLayoutProps) {
  const tool = getToolBySlug(slug);
  const [pageContent, ratingStats] = await Promise.all([
    getPageContent(slug),
    getToolRatingStats(slug),
  ]);

  const rating = resolvePublishedToolRating(slug, ratingStats);
  const headings = extractTableOfContents(pageContent);
  const hasSeoContent = pageContent.trim().length > 0;

  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: tool.title },
  ];

  return (
    <main className="container mx-auto py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <TableOfContents headings={headings} />
        <div className="flex-1 min-w-0 max-w-3xl">
          <VaerktoejerStructuredData
            type="tool"
            name={tool.title}
            description={structuredDataDescription}
            breadcrumbs={breadcrumbItems}
            toolType="calculator"
            calculatorType="other"
            toolSlug={slug}
            ratingStats={ratingStats}
          />
          <div className="space-y-6 sm:space-y-8">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-balance">
                {heading}
              </h1>
              {intro}
            </div>

            <div className="space-y-6 pb-8">
              {renderCalculator(rating)}
              <ToolFeedback toolSlug={slug} />
            </div>

            {note && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-700 text-pretty">{note}</p>
              </div>
            )}

            <div className="space-y-12">
              <div className="relative w-full aspect-[16/10] mt-8">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover rounded-xl ring-1 ring-black/10"
                  priority
                />
              </div>

              {hasSeoContent && (
                <div className={PROSE_CLASSES}>
                  <MDXRemote
                    source={pageContent}
                    components={buildMdxComponents(`Billede fra ${tool.title}`)}
                    options={buildToolPageMdxOptions(`/vaerktoejer/${slug}`)}
                  />
                </div>
              )}
            </div>

            <RelatedToolsSection currentToolHref={`/vaerktoejer/${slug}`} />
          </div>
        </div>
      </div>
    </main>
  );
}
