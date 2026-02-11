import { Metadata } from "next";
import { TranslatorForm } from "./components/TranslatorForm";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Shield, Clock } from "lucide-react";
import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import WebAppStructuredData from "@/components/seo/VaerktoejerStructuredData";
import { getPageContent } from "@/lib/pageContent";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypeInternalLinks from "lib/internal-linking/rehype-internal-links";
import { loadLinkConfig } from "lib/internal-linking/config";
import RelatedToolsSection from "@/components/features/RelatedToolsSection";

export const metadata: Metadata = {
  title: "Forstå dit MR-resultat ✓",
  description: "Forstå din MR-scanning uden lægesprog. Oversæt din MR-scanning rapport og få en klar forklaring på fund, begreber og konklusioner – hurtigt og gratis.",
  openGraph: {
    title: "Forstå dit MR-resultat ✓",
    description: "Forstå din MR-scanning uden lægesprog. Oversæt din MR-scanning rapport og få en klar forklaring på fund, begreber og konklusioner – hurtigt og gratis.",
    images: [
      {
        url: "/images/mr-scanning/mr-scanning.png",
        width: 1200,
        height: 630,
        alt: "MR-scanning maskine i et hospital miljø",
      },
    ],
    type: "website",
  },
};

// Custom component for rendering images within MDX
const MdxImage = (props: any) => {
  // Attempt to replicate the 'fill' behavior with responsive layout
  // You might need to adjust width/height or layout based on your specific image needs
  return (
    <div className="relative w-full aspect-[16/10] my-4 sm:my-6">
      <Image
        {...props}
        fill
        className="object-cover rounded-xl"
        alt={props.alt || "Billede fra MR-scanning guide"} // Provide a default alt text
      />
    </div>
  );
};

const mdxComponents = {
  img: MdxImage,
  // Add other custom components here if needed (e.g., for tables if prose styling isn't enough)
  // table: (props: any) => <table className="custom-table-class" {...props} />,
};

export default async function MRScanPage() {
  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: "MR-scanning Oversætter" },
  ];

  const pageContent = await getPageContent("mr-scanning");
  const linkConfig = loadLinkConfig();
  const currentPagePath = "/mr-scanning";

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
      <WebAppStructuredData
        type="tool"
        name="MR-scanning Oversætter"
        description="Oversæt din MR-scanning rapport til letforståeligt dansk"
        breadcrumbs={breadcrumbItems}
      />
      <div className="space-y-6 sm:space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Hvad betyder din MR-scanning? Oversæt din MR-rapport til letforståeligt dansk
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Få din MR-scanning rapport oversat til letforståeligt dansk.
          </p>
        </div>

        <div className="pb-8">
          <ErrorBoundary>
            <TranslatorForm />
          </ErrorBoundary>
        </div>

        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">
              MR-scanning resultat oversætter: Sådan gør du
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                Indsæt din tekst fra din MR-scanning. Du kan som regel finde den
                på sundhed.dk eller MinSundhed appen.
              </li>
              <li>
                Lad vores værktøj analysere dit resultat og give dig et svar på
                under 30 sekunder.
              </li>
            </ol>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-logo-blue flex-shrink-0" />
              <div>
                <h3 className="font-medium">100% anonymt</h3>
                <p className="text-sm text-gray-600">
                  Du giver ingen personlig data og vi gemmer intet.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-logo-blue flex-shrink-0" />
              <div>
                <h3 className="font-medium">Gratis og hurtigt</h3>
                <p className="text-sm text-gray-600">
                  Du får svar på under 30 sekunder - helt gratis!
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full aspect-[16/10] mt-8">
            <Image
              src="/images/mr-scanning/mr-scanning.png"
              alt="Moderne MR-scanner (Magnetic Resonance Imaging) i et lyst, professionelt hospitalsmiljø"
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
                    rehypeUnwrapImages,
                    [rehypeInternalLinks, { linkConfig, currentPagePath }],
                  ],
                },
              }}
            />
          </div>
        </div>
        
        <RelatedToolsSection currentToolHref="/mr-scanning" />
      </div>
    </main>
  );
}
