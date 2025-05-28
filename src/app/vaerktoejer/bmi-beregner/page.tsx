import { Metadata } from "next";
import { BMICalculator } from "./components/BMICalculator";
import { Calculator, Shield, Clock } from "lucide-react";
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
  title: "BMI-beregner: Beregn og forstå dit Body Mass Index tal ✅",
  description:
    "Beregn dit BMI (Body Mass Index) med vores gratis BMI-beregner. Få din vægtklassifikation og sundhedsrådgivning.",
};

// Custom component for rendering images within MDX
const MdxImage = (props: any) => {
  return (
    <div className="relative w-full aspect-[16/10] my-4 sm:my-6">
      <Image
        {...props}
        fill
        className="object-cover rounded-xl"
        alt={props.alt || "Billede fra BMI-beregner guide"}
      />
    </div>
  );
};

const mdxComponents = {
  img: MdxImage,
};

export default async function BMICalculatorPage() {
  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: "BMI-beregner" },
  ];

  const pageContent = await getPageContent("bmi-beregner");
  const linkConfig = loadLinkConfig();
  const currentPagePath = "/vaerktoejer/bmi-beregner";

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
      <WebAppStructuredData
        type="tool"
        name="BMI-beregner"
        description="Beregn dit BMI (Body Mass Index) med vores gratis BMI-beregner"
        breadcrumbs={breadcrumbItems}
        toolType="calculator"
        calculatorType="bmi"
      />
      <div className="space-y-6 sm:space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            BMI-beregner: Beregn og forstå dit Body Mass Index tal
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            BMI (Body Mass Index) er en enkel metode til at vurdere, om du har
            en sund vægt i forhold til din højde. Det er et nyttigt værktøj til
            at få et overblik over din generelle sundhed og kan hjælpe dig med
            at forstå, om du er i risiko for vægtrelaterede helbredsproblemer.
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            På denne side kan du nemt beregne dit BMI-tal og få indsigt i, hvad
            det betyder for din sundhed.
          </p>
        </div>

        <div className="pb-8">
          <BMICalculator />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            <strong>OBS</strong>:{" "}
            <em>
              BMI er kun en indikator og tager ikke højde for muskelmasse,
              knogletæthed eller fedtfordeling. Konsulter altid en
              sundhedsprofessionel for en komplet sundhedsvurdering.
            </em>
          </p>
        </div>

        <div className="space-y-12">
          <div className="relative w-full aspect-[16/10] mt-8">
            <Image
              src="/images/vaerktoejer/bmi-beregner.png"
              alt="BMI-beregner illustration med vægt og målebånd"
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
