import { Metadata } from "next";
import { HormoneBalanceCalculator } from "./components/HormoneBalanceCalculator";
import { Activity, Shield, Clock } from "lucide-react";
import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import WebAppStructuredData from "@/components/seo/VaerktoejerStructuredData";
import { getPageContent } from "@/lib/pageContent";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypeInternalLinks from "lib/internal-linking/rehype-internal-links";
import { loadLinkConfig } from "lib/internal-linking/config";

export const metadata: Metadata = {
  title: "Hormonbalance beregner | Genopret din hormonelle balance",
  description:
    "Beregn din hormonbalance med vores gratis hormonbalance-beregner. Få personlige anbefalinger baseret på livsstil og sundhedsfaktorer.",
};

// Custom component for rendering images within MDX
const MdxImage = (props: any) => {
  return (
    <div className="relative w-full aspect-[16/10] my-4 sm:my-6">
      <Image
        {...props}
        fill
        className="object-cover rounded-xl"
        alt={props.alt || "Billede fra hormonbalance-beregner guide"}
      />
    </div>
  );
};

const mdxComponents = {
  img: MdxImage,
};

export default async function HormoneBalanceCalculatorPage() {
  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: "Hormonbalance-beregner" },
  ];

  const pageContent = await getPageContent("hormonbalance-beregner");
  const linkConfig = loadLinkConfig();
  const currentPagePath = "/vaerktoejer/hormonbalance-beregner";

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
      <WebAppStructuredData
        type="tool"
        name="Hormonbalance-beregner"
        description="Beregn din hormonbalance med vores gratis hormonbalance-beregner"
        breadcrumbs={breadcrumbItems}
        toolType="calculator"
        calculatorType="other"
      />
      <div className="space-y-6 sm:space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Hormonbalance beregner: Bliv klogere på din hormonbalance
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Er du i tvivl om du er i hormonel ubalance - eller bare nysgerrig
            på, hvordan dine hormoner påvirker din krop og sundhed? Prøv vores{" "}
            <strong>hormonbalance beregner</strong>, som hjælper dig med at få
            indsigt i mulige tegn på hormonelle ubalancer baseret på dine
            symptomer.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Hormonelle forstyrrelser kan påvirke alt fra humør og søvn til vægt
            og fertilitet - særligt for kvinder i overgang, graviditet eller
            stressede perioder. Beregneren er ikke en medicinsk diagnose, men et
            hjælpsomt værktøj til at tage det første skridt mod bedre hormonel
            sundhed.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">
            FysFinder's hormonbalance beregner - Få indsigt i symptomer på
            hormonel ubalance
          </h2>
        </div>

        <div className="pb-8">
          <HormoneBalanceCalculator />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            <strong>OBS</strong>:{" "}
            <em>
              Denne beregner er kun en indikator baseret på livsstilsfaktorer og
              erstatter ikke professionel medicinsk rådgivning. Konsulter altid
              en læge ved mistanke om hormonelle problemer.
            </em>
          </p>
        </div>

        <div className="space-y-12">
          <div className="relative w-full aspect-[16/10] mt-8">
            <Image
              src="/images/vaerktoejer/hormon-balance.png"
              alt="Hormonbalance-beregner illustration med sundhedssymboler"
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
      </div>
    </main>
  );
}
