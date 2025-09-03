import Link from "next/link";
import Image from "next/image";

interface Tool {
  title: string;
  description: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  type: string;
}

interface RelatedToolsSectionProps {
  currentToolHref: string;
  title?: string;
  description?: string;
}

const allTools: Tool[] = [
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
];

const RelatedToolsSection = ({ 
  currentToolHref, 
  title = "Andre nyttige værktøjer", 
  description = "Udforsk vores andre gratis værktøjer og beregnere til at forbedre din sundhed og træning."
}: RelatedToolsSectionProps) => {
  // Define related tool pairs
  const relatedPairs: { [key: string]: string } = {
    "/vaerktoejer/bmi-beregner": "/vaerktoejer/kalorieberegner",
    "/vaerktoejer/kalorieberegner": "/vaerktoejer/bmi-beregner",
    "/mr-scanning": "/dexa-scanning",
    "/dexa-scanning": "/mr-scanning",
  };

  // Filter out the current tool and sort to prioritize related tools
  const relatedTools = allTools
    .filter(tool => tool.href !== currentToolHref)
    .sort((a, b) => {
      const relatedTool = relatedPairs[currentToolHref];
      
      // If there's a related tool, prioritize it
      if (relatedTool) {
        if (a.href === relatedTool) return -1;
        if (b.href === relatedTool) return 1;
      }
      
      // Otherwise maintain original order
      return 0;
    });

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedTools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group h-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ease-in-out group-hover:shadow-md group-hover:-translate-y-1 h-full flex flex-col">
              <div className="relative aspect-[16/9] flex-shrink-0">
                <Image
                  src={tool.imageUrl}
                  alt={tool.imageAlt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-logo-blue transition-colors">
                  {tool.title}
                </h4>
                <p className="text-sm text-gray-600 flex-1">{tool.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedToolsSection;
