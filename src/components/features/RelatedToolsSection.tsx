import Link from "next/link";
import Image from "next/image";
import { tools as allTools } from "@/lib/tools/registry";

interface RelatedToolsSectionProps {
  currentToolHref: string;
  title?: string;
  description?: string;
}

const RelatedToolsSection = ({ 
  currentToolHref, 
  title = "Andre nyttige værktøjer", 
  description = "Udforsk vores andre gratis værktøjer og beregnere til at forbedre din sundhed og træning."
}: RelatedToolsSectionProps) => {
  // Define related tool pairs
  const relatedPairs: { [key: string]: string } = {
    "/vaerktoejer/bmi-beregner": "/vaerktoejer/fedtprocent-beregner",
    "/vaerktoejer/kalorieberegner": "/vaerktoejer/bmi-beregner",
    "/vaerktoejer/fedtprocent-beregner": "/vaerktoejer/bmi-beregner",
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
