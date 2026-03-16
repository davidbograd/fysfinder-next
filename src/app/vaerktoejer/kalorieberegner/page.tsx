import { Metadata } from "next";
import { CalorieCalculator } from "./components/CalorieCalculator";
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
  title: "Kalorieberegner (TDEE): Beregn dit daglige kaloriebehov ✅",
  description:
    "Beregn dit daglige kaloriebehov med vores gratis kalorieberegner. Få dit BMR, TDEE og anbefalinger til vægttab og vægtøgning.",
  openGraph: {
    title: "Kalorieberegner (TDEE): Beregn dit daglige kaloriebehov ✅",
    description:
      "Beregn dit daglige kaloriebehov med vores gratis kalorieberegner. Få dit BMR, TDEE og anbefalinger til vægttab og vægtøgning.",
    images: [
      {
        url: "/images/vaerktoejer/kalorieberegner.png",
        width: 1200,
        height: 630,
        alt: "Sunde fødevarer og målebånd der illustrerer kalorieopmåling",
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
        alt={props.alt || "Billede fra kalorieberegner guide"}
      />
    </div>
  );
};

const mdxComponents = {
  img: MdxImage,
};

export default async function CalorieCalculatorPage() {
  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: "Kalorieberegner" },
  ];

  const pageContent = await getPageContent("kalorieberegner");
  const linkConfig = loadLinkConfig();
  const currentPagePath = "/vaerktoejer/kalorieberegner";
  const headings = extractTableOfContents(pageContent);

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <TableOfContents headings={headings} />
        <div className="flex-1 max-w-3xl">
          <WebAppStructuredData
            type="tool"
            name="Kalorieberegner"
            description="Beregn dit daglige kaloriebehov med vores gratis kalorieberegner"
            breadcrumbs={breadcrumbItems}
            toolType="calculator"
            calculatorType="calorie"
          />
          <div className="space-y-6 sm:space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Kalorieberegner - Beregn dit daglige kaloriebehov (ligevægtsindtag,
            TDEE)
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Hvor mange kalorier du bør indtage for at opretholde din nuværende
            vægt? Vores kalorieberegner hjælper dig med at finde ud af, hvor
            mange kalorier du skal indtage dagligt for at holde din vægt stabil,
            tabe dig eller tage på.
          </p>
        </div>

        <div className="pb-8">
          <CalorieCalculator />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            <strong>OBS</strong>:{" "}
            <em>
              Hvis du ønsker et større og længerevarende vægttab, så husk at
              genberegne dit daglige kaloriebehov i takt med at du taber dig. Fx
              hver gang du har tabt 5 kg. Så får du løbende justeret dit
              kalorieindtag til din nye og lavere vægt.
            </em>
          </p>
        </div>

        <div className="space-y-12">
          <div className="relative w-full aspect-[16/10] mt-8">
            <Image
              src="/images/vaerktoejer/kalorieberegner.png"
              alt="Sunde fødevarer og målebånd der illustrerer kalorieopmåling og sund kost"
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
            <RelatedToolsSection currentToolHref="/vaerktoejer/kalorieberegner" />
          </div>
        </div>
      </div>
    </main>
  );
}
