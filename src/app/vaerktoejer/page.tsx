import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import VaerktoejerStructuredData from "@/components/seo/VaerktoejerStructuredData";
import {
  groupToolsByCategory,
  TOOL_CATEGORY_ORDER,
  Tool,
  tools,
} from "@/lib/tools/registry";

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={tool.href} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1">
        <div className="relative aspect-[16/9]">
          <Image
            src={tool.imageUrl}
            alt={tool.imageAlt}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-logo-blue">
            {tool.title}
          </h2>
          <p className="text-gray-600">{tool.description}</p>
        </div>
      </div>
    </Link>
  );
}

export const metadata: Metadata = {
  title: "Gratis værktøjer og beregnere | Træning - Kost – Sundhed",
};

export default function ToolsPage() {
  const breadcrumbItems = [{ text: "Værktøjer" }];

  const groupedTools = groupToolsByCategory();
  const sectionOrder = TOOL_CATEGORY_ORDER;

  return (
    <div className="container mx-auto py-8">
      <VaerktoejerStructuredData
        type="overview"
        name="Gratis værktøjer og beregnere til bedre træning, kost og sundhed"
        description="Her finder du gratis værktøjer og beregnere til at forbedre din træning, kost og sundhed."
        breadcrumbs={breadcrumbItems}
        tools={tools}
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="md:text-4xl text-3xl font-bold mb-4">
            Gratis værktøjer og beregnere til bedre træning, kost og sundhed
          </h1>
          <p className="text-xl text-gray-600">
            Her finder du gratis værktøjer og beregnere til at forbedre din
            træning, kost og sundhed.
          </p>
        </div>
        {/* Render tools grouped by type in specified order */}
        <div className="space-y-12 mb-16">
          {sectionOrder.map((type) => {
            const toolsInSection = groupedTools[type];
            if (!toolsInSection || toolsInSection.length === 0) return null;

            return (
              <div key={type}>
                <h2 className="text-2xl font-semibold mb-4">{type}</h2>
                {type === "Kost & ernæring værktøjer" && (
                  <p className="text-gray-600 mb-6">
                    Få kontrol over din kost og ernæring med vores brugervenlige
                    værktøjer og beregnere. Beregn dine kalorier, lav kostplaner,
                    planlæg dine sunde måltider og find den rette balance til at
                    opnå dine mål.
                  </p>
                )}
                {type === "Forstå din MR og DEXA scanning" && (
                  <div className="mb-6">
                    <p className="text-gray-600">
                      Medicinske scanningsresultater kan være svære at forstå. Få
                      dine MR- og DEXA-scanninger forklaret i letforståeligt
                      dansk, og forstå din sundhedstilstand bedre.
                    </p>
                  </div>
                )}
                {type === "Træning & bevægelse værktøjer" && (
                  <p className="text-gray-600 mb-6">
                    Optimer din træning og bevægelse med vores værktøjer, der hjælper
                    dig med at blive stærkere og mere fleksibel. Uanset om du er
                    nybegynder eller erfaren.
                  </p>
                )}
                <div className="grid md:grid-cols-2 gap-8">
                  {toolsInSection.map((tool) => (
                    <ToolCard key={tool.href + tool.title} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="space-y-8 mt-16 max-w-prose mx-auto">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              Sundhed & velvære værktøjer
            </h2>
            <p className="text-gray-600">
              Opnå et sundere liv med vores værktøjer, der støtter dig med dit
              generelle velvære. Fra holdningsanalyse til livsstilsændringer,
              guider værktøjerne dig med at nå dit sundhedspotentiale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
