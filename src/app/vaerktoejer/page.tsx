import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import VaerktoejerStructuredData from "@/components/seo/VaerktoejerStructuredData";

interface Tool {
  title: string;
  description: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  type: string;
}

const tools: Tool[] = [
  {
    title: "MR-scanning oversætter",
    description:
      "Få din MR-scanning oversat til letforståeligt dansk og forstå din scanning bedre.",
    href: "/mr-scanning",
    imageUrl: "/images/mr-scanning/mr-scanning.png",
    imageAlt: "MR-scanning maskine i et hospital miljø",
    type: "Forstå din MR og DEXA scanning",
  },
  {
    title: "DEXA-scan oversætter",
    description:
      "Få din DEXA-scanning oversat til letforståeligt dansk og forstå din knoglesundhed bedre.",
    href: "/dexa-scanning",
    imageUrl: "/images/dexa-scanning/dexa-scanning.jpeg",
    imageAlt: "DEXA-scanning illustration",
    type: "Forstå din MR og DEXA scanning",
  },
  {
    title: "Test dine rygsmerter",
    description:
      "Vurder din risiko for langvarige rygsmerter. Få indsigt og anbefalinger til behandling.",
    href: "/start-back-screening-tool",
    imageUrl: "/images/vaerktoejer/ryg-smerter-survey.jpg",
    imageAlt: "STarT Back Screening Tool illustration",
    type: "Kropdele og smerter",
  },
  {
    title: "Kalorieberegner",
    description:
      "Beregn dit daglige kaloriebehov baseret på din alder, vægt, højde og aktivitetsniveau.",
    href: "/vaerktoejer/kalorieberegner",
    imageUrl: "/images/vaerktoejer/kalorieberegner.png",
    imageAlt: "Sunde fødevarer og målebånd der illustrerer kalorieopmåling",
    type: "Kost & ernæring værktøjer",
  },
  {
    title: "BMI-beregner",
    description:
      "Beregn dit BMI (Body Mass Index) og få indsigt i din vægtklassifikation baseret på vægt og højde.",
    href: "/vaerktoejer/bmi-beregner",
    imageUrl: "/images/vaerktoejer/bmi-beregner.png",
    imageAlt: "BMI-beregner illustration med vægt og målebånd",
    type: "Kost & ernæring værktøjer",
  },
  {
    title: "Fedtprocent beregner",
    description:
      "Beregn din fedtprocent med Navy metoden baseret på simple målinger af krop. Få indsigt i din kropssammensætning.",
    href: "/vaerktoejer/fedtprocent-beregner",
    imageUrl: "/images/vaerktoejer/fedtprocent-beregner.jpg",
    imageAlt: "Fedtprocent beregner illustration med målebånd og sundhedsudstyr",
    type: "Kost & ernæring værktøjer",
  },
  {
    title: "Pace beregner",
    description:
      "Beregn din løbehastighed (pace) i min/km og hastighed i km/t. Find din forventede sluttid på populære distancer.",
    href: "/vaerktoejer/pace-beregner",
    imageUrl: "/images/vaerktoejer/pace-beregner.png",
    imageAlt: "Pace beregner illustration med løber og stopur",
    type: "Træning & bevægelse værktøjer",
  },
  {
    title: "RM beregner",
    description:
      "Beregn din 1RM (one repetition maximum) og se anbefalet vægt til 1–10 repetitionsmaksimum. Optimer din styrketræning.",
    href: "/vaerktoejer/rm-beregner",
    imageUrl: "/images/vaerktoejer/1rm-beregner.jpg",
    imageAlt: "RM beregner illustration med vægtstang og løfter",
    type: "Træning & bevægelse værktøjer",
  },
];

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

  // Group tools by type
  const groupedTools = tools.reduce<{ [type: string]: Tool[] }>((acc, tool) => {
    if (!acc[tool.type]) acc[tool.type] = [];
    acc[tool.type].push(tool);
    return acc;
  }, {});

  // Define the order of sections
  const sectionOrder = [
    "Kost & ernæring værktøjer",
    "Træning & bevægelse værktøjer",
    "Forstå din MR og DEXA scanning",
    "Kropdele og smerter",
  ];

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
                {type === "Kropdele og smerter" && (
                  <p className="text-gray-600 mb-6">
                    Få hjælp til din genoptræning med vores fysioterapi-værktøjer.
                    Fra skadesvurdering til genoptræningsplaner – udnyt vores
                    værktøjer, der støtter dig mod bedring og styrkelse.
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
