import { Metadata } from "next";
import { BodyFatCalculator } from "./components/BodyFatCalculator";
import { Calculator, Shield, Clock } from "lucide-react";
import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import WebAppStructuredData from "@/components/seo/VaerktoejerStructuredData";
import { getPageContent } from "@/lib/pageContent";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypeSlug from "rehype-slug";
import rehypeInternalLinks from "lib/internal-linking/rehype-internal-links";
import { loadLinkConfig } from "lib/internal-linking/config";
import RelatedToolsSection from "@/components/features/RelatedToolsSection";
import { TableOfContents } from "@/components/features/blog-og-ordbog/TableOfContents";
import { extractTableOfContents } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Fedtprocent beregner: Beregn din kropsfedt med Navy metoden ✅",
  description:
    "Beregn din fedtprocent med vores gratis fedtprocent beregner baseret på Navy metoden. Få indsigt i din kropssammensætning og sundhed.",
  openGraph: {
    title: "Fedtprocent beregner: Beregn din kropsfedt med Navy metoden ✅",
    description:
      "Beregn din fedtprocent med vores gratis fedtprocent beregner baseret på Navy metoden. Få indsigt i din kropssammensætning og sundhed.",
    images: [
      {
        url: "/images/vaerktoejer/fedtprocent-beregner.jpg",
        width: 1200,
        height: 630,
        alt: "Fedtprocent beregner illustration med målebånd og sundhedsudstyr",
      },
    ],
    type: "website",
  },
};

// Custom component for rendering images within MDX
const MdxImage = (props: any) => {
  return (
    <div className="relative w-full aspect-[16/10] my-4 sm:my-6">
      <Image
        {...props}
        fill
        className="object-cover rounded-xl"
        alt={props.alt || "Billede fra fedtprocent beregner guide"}
      />
    </div>
  );
};

const mdxComponents = {
  img: MdxImage,
};

export default async function BodyFatCalculatorPage() {
  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: "Fedtprocent beregner" },
  ];

  const pageContent = await getPageContent("fedtprocent-beregner");
  const linkConfig = loadLinkConfig();
  const currentPagePath = "/vaerktoejer/fedtprocent-beregner";
  const headings = extractTableOfContents(pageContent);

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <TableOfContents headings={headings} />
        <div className="flex-1 max-w-3xl">
          <WebAppStructuredData
            type="tool"
            name="Fedtprocent beregner"
            description="Beregn din fedtprocent med vores gratis fedtprocent beregner baseret på Navy metoden"
            breadcrumbs={breadcrumbItems}
            toolType="calculator"
          />
          <div className="space-y-6 sm:space-y-8">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Fedtprocent beregner - Beregn din kropsfedt med Navy metoden
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Vil du gerne kende din fedtprocent uden avanceret udstyr? Med FysFinder's gratis fedtprocent beregner kan du nemt og hurtigt få et estimat på din kropsfedtprocent. Beregningen bygger på <strong>Navy-metoden</strong>, som er en af de mest anvendte og pålidelige måder at beregne fedtprocent på uden professionelt måleudstyr.
              </p>
              <p className="text-gray-600 text-sm sm:text-base">
                Indtast dine mål nedenfor for at få et <em>estimat</em> af din fedtprocent.
              </p>
            </div>

            <div className="pb-8">
              <BodyFatCalculator />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-700">
                <strong>OBS</strong>:{" "}
                <em>
                  Resultatet er et estimat og er derfor vejledende - ikke en medicinsk diagnose. Ønsker du en mere præcis måling af din fedtprocent, anbefaler vi at du får en DEXA-scanning.
                </em>
              </p>
            </div>

            <div className="space-y-12">
              <div className="relative w-full aspect-[16/10] mt-8">
                <Image
                  src="/images/vaerktoejer/fedtprocent-beregner.jpg"
                  alt="Fedtprocent beregner illustration med målebånd og sundhedsudstyr"
                  fill
                  className="object-cover rounded-xl"
                  priority
                />
              </div>

              {/* SEO Content rendered from Markdown */}
              <div
                className="prose prose-slate max-w-none 
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
                     prose-th:bg-logo-blue prose-th:text-white prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:border
                     prose-td:px-4 prose-td:py-2 prose-td:border
                     [&>*:first-child]:mt-0
                     [&>*:last-child]:mb-0"
              >
                <MDXRemote
                  source={pageContent}
                  components={mdxComponents}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [
                        rehypeSlug,
                        rehypeUnwrapImages,
                        [rehypeInternalLinks, { linkConfig, currentPagePath }],
                      ],
                    },
                  }}
                />
              </div>
            </div>

            <RelatedToolsSection currentToolHref="/vaerktoejer/fedtprocent-beregner" />
          </div>
        </div>
      </div>
    </main>
  );
}
