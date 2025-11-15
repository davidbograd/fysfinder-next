import React from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import VaerktoejerStructuredData from "@/components/seo/VaerktoejerStructuredData";
import { getPageContent } from "@/lib/pageContent";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypeInternalLinks from "lib/internal-linking/rehype-internal-links";
import { loadLinkConfig } from "lib/internal-linking/config";
import Image from "next/image";
import { StartBackToolClient } from "./components/StartBackToolClient";
import { Metadata } from "next";
import RelatedToolsSection from "@/components/features/RelatedToolsSection";

const MdxImage = (props: any) => {
  return (
    <div className="relative w-full aspect-[16/10] my-4 sm:my-6">
      <Image
        {...props}
        fill
        className="object-cover rounded-xl"
        alt={props.alt || "Billede fra STarT Back guide"}
      />
    </div>
  );
};

const mdxComponents = {
  img: MdxImage,
};

export const metadata: Metadata = {
  title: "STarT Back Screening – Opdag varige rygsmerter i tide",
  description:
    "Identificer om du er i risiko for varige rygsmerter med STarT Back Screening Tool. Svar på spørgsmålene og få en risikovurdering.",
  openGraph: {
    title: "STarT Back Screening – Opdag varige rygsmerter i tide",
    description:
      "Identificer om du er i risiko for varige rygsmerter med STarT Back Screening Tool. Svar på spørgsmålene og få en risikovurdering.",
    images: [
      {
        url: "/images/vaerktoejer/ryg-smerter-survey.jpg",
        width: 1200,
        height: 630,
        alt: "STarT Back Screening Tool illustration",
      },
    ],
    type: "website",
  },
};

export default async function StartBackScreeningToolPage() {
  const pageContent = await getPageContent("start-back-screening-tool");
  const linkConfig = loadLinkConfig();
  const currentPagePath = "/start-back-screening-tool";

  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: "STarT Back Screening Tool" },
  ];

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <VaerktoejerStructuredData
        type="tool"
        name="STarT Back Screening Tool"
        description="Vurder risikoen for langvarige rygsmerter med dette validerede spørgeskema"
        breadcrumbs={breadcrumbItems}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        STarT Back Screening – Vurder dine rygsmerter
      </h1>
      <p className="text-gray-600 text-sm sm:text-base mb-8">
        Identificer om du er i risiko for varige rygsmerter. Svar på
        spørgsmålene og få en risikovurdering.
      </p>

      <StartBackToolClient />

      <hr className="my-16" />
      <div
        className="prose prose-slate max-w-none mt-16 sm:mt-20
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
      
      <RelatedToolsSection currentToolHref="/start-back-screening-tool" />
    </div>
  );
}
