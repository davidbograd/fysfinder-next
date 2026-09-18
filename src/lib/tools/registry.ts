// Single source of truth for the Fysfinder tools (værktøjer).
// Previously duplicated between src/app/vaerktoejer/page.tsx and RelatedToolsSection.

export const TOOL_SLUGS = [
  "mr-scanning",
  "dexa-scanning",
  "kalorieberegner",
  "bmi-beregner",
  "fedtprocent-beregner",
  "pace-beregner",
  "rm-beregner",
] as const;

export type ToolSlug = (typeof TOOL_SLUGS)[number];

export type ToolCategory =
  | "Kost & ernæring værktøjer"
  | "Træning & bevægelse værktøjer"
  | "Forstå din MR og DEXA scanning";

export interface Tool {
  slug: ToolSlug;
  title: string;
  /**
   * Definite-form name for use mid-sentence, e.g. "Hjalp BMI-beregneren dig?".
   * The display titles are indefinite and read as broken Danish there.
   */
  feedbackName: string;
  description: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  type: ToolCategory;
}

export const tools: Tool[] = [
  {
    slug: "mr-scanning",
    title: "MR-scanning oversætter",
    feedbackName: "MR-oversætteren",
    description:
      "Få din MR-scanning oversat til letforståeligt dansk og forstå din scanning bedre.",
    href: "/vaerktoejer/mr-scanning",
    imageUrl: "/images/mr-scanning/mr-scanning.png",
    imageAlt: "MR-scanning maskine i et hospital miljø",
    type: "Forstå din MR og DEXA scanning",
  },
  {
    slug: "dexa-scanning",
    title: "DEXA-scan oversætter",
    feedbackName: "DEXA-oversætteren",
    description:
      "Få din DEXA-scanning oversat til letforståeligt dansk og forstå din knoglesundhed bedre.",
    href: "/vaerktoejer/dexa-scanning",
    imageUrl: "/images/dexa-scanning/dexa-scanning.jpeg",
    imageAlt: "DEXA-scanning illustration",
    type: "Forstå din MR og DEXA scanning",
  },
  {
    slug: "kalorieberegner",
    title: "Kalorieberegner",
    feedbackName: "kalorieberegneren",
    description:
      "Beregn dit daglige kaloriebehov baseret på din alder, vægt, højde og aktivitetsniveau.",
    href: "/vaerktoejer/kalorieberegner",
    imageUrl: "/images/vaerktoejer/kalorieberegner.png",
    imageAlt: "Sunde fødevarer og målebånd der illustrerer kalorieopmåling",
    type: "Kost & ernæring værktøjer",
  },
  {
    slug: "bmi-beregner",
    title: "BMI-beregner",
    feedbackName: "BMI-beregneren",
    description:
      "Beregn dit BMI (Body Mass Index) og få indsigt i din vægtklassifikation baseret på vægt og højde.",
    href: "/vaerktoejer/bmi-beregner",
    imageUrl: "/images/vaerktoejer/bmi-beregner.png",
    imageAlt: "BMI-beregner illustration med vægt og målebånd",
    type: "Kost & ernæring værktøjer",
  },
  {
    slug: "fedtprocent-beregner",
    title: "Fedtprocent beregner",
    feedbackName: "fedtprocentberegneren",
    description:
      "Beregn din fedtprocent med Navy metoden baseret på simple målinger af din krop. Få indsigt i din kropssammensætning.",
    href: "/vaerktoejer/fedtprocent-beregner",
    imageUrl: "/images/vaerktoejer/fedtprocent-beregner.jpg",
    imageAlt: "Fedtprocent beregner illustration med målebånd og sundhedsudstyr",
    type: "Kost & ernæring værktøjer",
  },
  {
    slug: "pace-beregner",
    title: "Pace beregner",
    feedbackName: "paceberegneren",
    description:
      "Beregn din løbehastighed (pace) i min/km og hastighed i km/t. Find din forventede sluttid på populære distancer.",
    href: "/vaerktoejer/pace-beregner",
    imageUrl: "/images/vaerktoejer/pace-beregner.png",
    imageAlt: "Pace beregner illustration med løber og stopur",
    type: "Træning & bevægelse værktøjer",
  },
  {
    slug: "rm-beregner",
    title: "RM beregner",
    feedbackName: "RM-beregneren",
    description:
      "Beregn din 1RM (one repetition maximum) og se anbefalet vægt til 1–10 repetitionsmaksimum. Optimer din styrketræning.",
    href: "/vaerktoejer/rm-beregner",
    imageUrl: "/images/vaerktoejer/1rm-beregner.jpg",
    imageAlt: "RM beregner illustration med vægtstang og løfter",
    type: "Træning & bevægelse værktøjer",
  },
];

export const TOOL_CATEGORY_ORDER: ToolCategory[] = [
  "Kost & ernæring værktøjer",
  "Træning & bevægelse værktøjer",
  "Forstå din MR og DEXA scanning",
];

export function isToolSlug(value: unknown): value is ToolSlug {
  return (
    typeof value === "string" && (TOOL_SLUGS as readonly string[]).includes(value)
  );
}

export function getToolBySlug(slug: ToolSlug): Tool {
  const tool = tools.find((candidate) => candidate.slug === slug);
  if (!tool) {
    throw new Error(`Unknown tool slug: ${slug}`);
  }
  return tool;
}

export function groupToolsByCategory(): Record<string, Tool[]> {
  return tools.reduce<Record<string, Tool[]>>((acc, tool) => {
    if (!acc[tool.type]) acc[tool.type] = [];
    acc[tool.type].push(tool);
    return acc;
  }, {});
}
