// Single source of truth for the Fysfinder tools (værktøjer).
// Updated: 2026-10-11 - Per-tool related tools for "Andre nyttige værktøjer".
// Previously duplicated between src/app/vaerktoejer/page.tsx and RelatedToolsSection.

export const TOOL_SLUGS = [
  "mr-scanning",
  "dexa-scanning",
  "kalorieberegner",
  "bmi-beregner",
  "fedtprocent-beregner",
  "pace-beregner",
  "rm-beregner",
  "kondital-beregner",
  "hoejdeberegner",
  "hvilestofskifte-beregner",
  "muskelmasse-beregner",
  "proteinberegner",
  "makroberegner",
  "bodyage-beregner",
  "watt-pr-kg-beregner",
  "ftp-beregner",
  "terminsberegner",
  "aegloesningsberegner",
] as const;

export type ToolSlug = (typeof TOOL_SLUGS)[number];

export type ToolCategory =
  | "Kost & ernæring værktøjer"
  | "Sundhed & velvære værktøjer"
  | "Træning & bevægelse værktøjer"
  | "Graviditet & fertilitet værktøjer"
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
  /**
   * Tools shown under "Andre nyttige værktøjer", most relevant first. Only
   * list tools that are a natural next step from this page; leave empty if
   * none are, and random tools are shown instead.
   */
  relatedTools: readonly ToolSlug[];
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
    relatedTools: [],
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
    relatedTools: ["fedtprocent-beregner", "muskelmasse-beregner"],
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
    relatedTools: ["makroberegner", "hvilestofskifte-beregner", "proteinberegner", "bmi-beregner"],
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
    type: "Sundhed & velvære værktøjer",
    relatedTools: ["fedtprocent-beregner", "muskelmasse-beregner", "kalorieberegner"],
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
    type: "Sundhed & velvære værktøjer",
    relatedTools: ["bmi-beregner", "muskelmasse-beregner", "dexa-scanning"],
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
    relatedTools: ["kondital-beregner", "watt-pr-kg-beregner"],
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
    relatedTools: ["muskelmasse-beregner", "proteinberegner"],
  },
  {
    slug: "kondital-beregner",
    title: "Kondital beregner",
    feedbackName: "konditalberegneren",
    description:
      "Beregn dit kondital (VO2-max) ud fra din hvilepuls eller en Cooper-test, og se hvor du ligger for din alder og dit køn.",
    href: "/vaerktoejer/kondital-beregner",
    imageUrl: "/images/vaerktoejer/kondital-beregner.jpg",
    imageAlt: "Løber på en atletikbane i solnedgang",
    type: "Træning & bevægelse værktøjer",
    relatedTools: ["bodyage-beregner", "pace-beregner", "watt-pr-kg-beregner"],
  },
  {
    slug: "hoejdeberegner",
    title: "Højdeberegner",
    feedbackName: "højdeberegneren",
    description:
      "Beregn dit barns forventede sluthøjde ud fra forældrenes højde med midtforældre-metoden.",
    href: "/vaerktoejer/hoejdeberegner",
    imageUrl: "/images/vaerktoejer/hoejdeberegner-foraeldre-barn-hoejdemaaler.jpg",
    imageAlt: "Forældre og barn ved en højdemåler på væggen – beregn barnets forventede voksenhøjde ud fra forældrenes højde",
    type: "Sundhed & velvære værktøjer",
    relatedTools: [],
  },
  {
    slug: "hvilestofskifte-beregner",
    title: "Hvilestofskifte beregner",
    feedbackName: "hvilestofskifte-beregneren",
    description:
      "Udregn dit hvilestofskifte – det antal kalorier din krop bruger i hvile, før du lægger aktivitet oveni.",
    href: "/vaerktoejer/hvilestofskifte-beregner",
    imageUrl: "/images/vaerktoejer/hvilestofskifte-beregner-kvinde-hviler-sofa.jpg",
    imageAlt: "Kvinde der hviler på sofaen – hvilestofskiftet er den energi, kroppen forbrænder i hvile",
    type: "Kost & ernæring værktøjer",
    relatedTools: ["kalorieberegner", "muskelmasse-beregner", "proteinberegner"],
  },
  {
    slug: "muskelmasse-beregner",
    title: "Muskelmasse beregner",
    feedbackName: "muskelmasseberegneren",
    description:
      "Estimer din muskelmasse – enten med målebånd eller ud fra højde, vægt, alder og køn.",
    href: "/vaerktoejer/muskelmasse-beregner",
    imageUrl: "/images/vaerktoejer/muskelmasse-beregner-styrketraening-biceps-curl.jpg",
    imageAlt: "Mand laver biceps curl med håndvægt i fitnesscenter – beregn din muskelmasse",
    type: "Træning & bevægelse værktøjer",
    relatedTools: ["fedtprocent-beregner", "proteinberegner", "rm-beregner"],
  },
  {
    slug: "proteinberegner",
    title: "Proteinberegner",
    feedbackName: "proteinberegneren",
    description:
      "Beregn hvor meget protein du har brug for om dagen ud fra din vægt, dit mål og dit aktivitetsniveau.",
    href: "/vaerktoejer/proteinberegner",
    imageUrl: "/images/vaerktoejer/proteinberegner-proteinrig-mad.jpg",
    imageAlt: "Tallerken med proteinrig mad: kylling, laks, oksekød, æg, tofu, kikærter og quinoa",
    type: "Kost & ernæring værktøjer",
    relatedTools: ["muskelmasse-beregner", "makroberegner", "kalorieberegner", "rm-beregner"],
  },
  {
    slug: "makroberegner",
    title: "Makroberegner",
    feedbackName: "makroberegneren",
    description:
      "Fordel dine daglige kalorier på protein, kulhydrat og fedt – og se dine makroer i gram, både pr. dag og pr. måltid.",
    href: "/vaerktoejer/makroberegner",
    imageUrl: "/images/vaerktoejer/makroberegner-tallerken-laks-groentsager.jpg",
    imageAlt: "Tallerken med laks, grønne bønner og cherrytomater – fordel dine makroer på protein, kulhydrat og fedt",
    type: "Kost & ernæring værktøjer",
    relatedTools: ["kalorieberegner", "proteinberegner", "hvilestofskifte-beregner"],
  },
  {
    slug: "bodyage-beregner",
    title: "Bodyage beregner",
    feedbackName: "bodyage-beregneren",
    description:
      "Find din biologiske alder ud fra din kondition – beregnet med NTNU's fitnessalder-model ud fra taljemål, hvilepuls og træningsvaner.",
    href: "/vaerktoejer/bodyage-beregner",
    imageUrl: "/images/vaerktoejer/bodyage-beregner-person-paa-sportsbane.jpg",
    imageAlt: "Person ligger på en sportsbane mellem tallene 20, 30 og 40 – beregn din krops alder",
    type: "Sundhed & velvære værktøjer",
    relatedTools: ["kondital-beregner", "fedtprocent-beregner", "bmi-beregner"],
  },
  {
    slug: "watt-pr-kg-beregner",
    title: "Watt pr. kg beregner",
    feedbackName: "watt pr. kg-beregneren",
    description:
      "Beregn din watt pr. kg ud fra din FTP og vægt, og se hvilket niveau du ligger på som cykelrytter.",
    href: "/vaerktoejer/watt-pr-kg-beregner",
    imageUrl: "/images/vaerktoejer/watt-pr-kg-beregner-cykelryttere-ved-kysten.jpg",
    imageAlt: "To cykelryttere på landevejscykler ved kysten – beregn din watt pr. kg",
    type: "Træning & bevægelse værktøjer",
    relatedTools: ["ftp-beregner", "kondital-beregner", "pace-beregner"],
  },
  {
    slug: "ftp-beregner",
    title: "FTP beregner",
    feedbackName: "FTP-beregneren",
    description:
      "Beregn din FTP ud fra en 20-minutterstest eller en ramptest, og få dine syv wattzoner til cykeltræning.",
    href: "/vaerktoejer/ftp-beregner",
    imageUrl: "/images/vaerktoejer/ftp-beregner-landevejsrytter-i-fart.jpg",
    imageAlt: "Landevejsrytter i fart på cyklen – beregn din FTP og dine wattzoner",
    type: "Træning & bevægelse værktøjer",
    relatedTools: ["watt-pr-kg-beregner", "kondital-beregner", "pace-beregner"],
  },
  {
    slug: "terminsberegner",
    title: "Terminsberegner",
    feedbackName: "terminsberegneren",
    description:
      "Beregn din terminsdato ud fra sidste menstruation eller undfangelse, og se hvilken graviditetsuge du er i.",
    href: "/vaerktoejer/terminsberegner",
    imageUrl: "/images/vaerktoejer/terminsberegner-mor-holder-nyfoedt-baby.jpg",
    imageAlt: "Mor holder sin nyfødte baby – beregn din terminsdato",
    type: "Graviditet & fertilitet værktøjer",
    relatedTools: ["aegloesningsberegner", "proteinberegner"],
  },
  {
    slug: "aegloesningsberegner",
    title: "Ægløsningsberegner",
    feedbackName: "ægløsningsberegneren",
    description:
      "Find din ægløsning og dine mest frugtbare dage ud fra din cyklus – og se hvornår du nemmest kan blive gravid.",
    href: "/vaerktoejer/aegloesningsberegner",
    imageUrl: "/images/vaerktoejer/aegloesningsberegner-illustration-livmoder.jpg",
    imageAlt: "Illustration af livmoder og æggestokke med sædceller – beregn din ægløsning",
    type: "Graviditet & fertilitet værktøjer",
    relatedTools: ["terminsberegner"],
  },
];

// Built but not launched yet: hidden from listings and the sitemap, and the
// pages 404 in production. Remove a slug from here to launch the tool.
export const UNRELEASED_TOOL_SLUGS: readonly ToolSlug[] = [];

export function isToolReleased(slug: ToolSlug): boolean {
  return !UNRELEASED_TOOL_SLUGS.includes(slug);
}

export const releasedTools: Tool[] = tools.filter((tool) =>
  isToolReleased(tool.slug)
);

export const TOOL_CATEGORY_ORDER: ToolCategory[] = [
  "Kost & ernæring værktøjer",
  "Sundhed & velvære værktøjer",
  "Træning & bevægelse værktøjer",
  "Graviditet & fertilitet værktøjer",
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
  return releasedTools.reduce<Record<string, Tool[]>>((acc, tool) => {
    if (!acc[tool.type]) acc[tool.type] = [];
    acc[tool.type].push(tool);
    return acc;
  }, {});
}

export const MAX_RELATED_TOOLS = 3;

function hashString(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

// Seeded by slug so a page keeps the same "random" tools across ISR renders.
function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const result = [...items];
  let state = hashString(seed) || 1;
  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getRelatedTools(slug: ToolSlug): Tool[] {
  const candidates = releasedTools.filter((tool) => tool.slug !== slug);
  const related = getToolBySlug(slug)
    .relatedTools.map((relatedSlug) =>
      candidates.find((tool) => tool.slug === relatedSlug)
    )
    .filter((tool): tool is Tool => tool !== undefined)
    .slice(0, MAX_RELATED_TOOLS);

  if (related.length > 0) return related;
  return seededShuffle(candidates, slug).slice(0, MAX_RELATED_TOOLS);
}
