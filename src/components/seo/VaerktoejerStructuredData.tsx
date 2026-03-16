interface StructuredDataProps {
  type: "overview" | "tool";
  name: string;
  description: string;
  breadcrumbs: {
    text: string;
    link?: string;
  }[];
  tools?: {
    title: string;
    description: string;
    href: string;
    imageUrl: string;
    imageAlt: string;
  }[];
  toolType?: "calculator" | "translator" | "screening";
  calculatorType?: "bmi" | "calorie" | "rm" | "other";
}

export default function VaerktoejerStructuredData({
  type,
  name,
  description,
  breadcrumbs,
  tools,
  toolType,
  calculatorType,
}: StructuredDataProps) {
  const baseUrl = "https://fysfinder.dk";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": item.link ? `${baseUrl}${item.link}` : undefined,
        name: item.text,
      },
    })),
  };

  // Enhanced WebApplication schema for tool pages
  const webAppSchema =
    type === "tool"
      ? {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name,
          description,
          applicationCategory: "HealthApplication",
          operatingSystem: "Web",
          browserRequirements: "JavaScript enabled",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "DKK",
            availability: "https://schema.org/InStock",
          },
          provider: {
            "@type": "Organization",
            name: "FysFinder",
            url: baseUrl,
          },
          featureList: [
            "Gratis beregning",
            "Øjeblikkelige resultater",
            "Ingen registrering påkrævet",
            "Mobilvenlig",
          ],
          audience: {
            "@type": "Audience",
            audienceType: "Sundhedsinteresserede",
          },
        }
      : null;

  // HowTo schema removed - no steps needed

  // FAQ schema for calculator tools
  const getFAQSchema = () => {
    if (calculatorType === "bmi") {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Hvad er BMI?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "BMI (Body Mass Index) er en beregning der bruges til at vurdere om din vægt er sund i forhold til din højde. Det beregnes ved at dividere vægten i kg med højden i meter i anden potens.",
            },
          },
          {
            "@type": "Question",
            name: "Hvad er et normalt BMI?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Et normalt BMI er mellem 18,5 og 24,9 ifølge Verdenssundhedsorganisationen (WHO). Under 18,5 betragtes som undervægt, 25-29,9 som overvægt, og 30+ som svært overvægt.",
            },
          },
          {
            "@type": "Question",
            name: "Er BMI-beregneren gratis at bruge?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Ja, vores BMI-beregner er helt gratis at bruge. Du behøver ikke at registrere dig eller give personlige oplysninger.",
            },
          },
          {
            "@type": "Question",
            name: "Tager BMI højde for muskelmasse?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nej, BMI tager ikke højde for muskelmasse eller fedtfordeling. Derfor kan atleter med høj muskelmasse have et højt BMI uden at være overvægtige.",
            },
          },
        ],
      };
    } else if (calculatorType === "calorie") {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Hvad er TDEE?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "TDEE (Total Daily Energy Expenditure) er dit totale daglige energiforbrug, som inkluderer grundstofskifte (BMR), fysisk aktivitet og fordøjelse.",
            },
          },
          {
            "@type": "Question",
            name: "Hvad er BMR?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "BMR (Basal Metabolic Rate) eller grundstofskifte er det antal kalorier din krop forbrænder i hvile for at opretholde basale kropsfunktioner som vejrtrækning og blodcirkulation.",
            },
          },
          {
            "@type": "Question",
            name: "Hvor mange kalorier skal jeg spise for at tabe mig?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "For at tabe vægt skal du spise færre kalorier end din TDEE. Et moderat kalorieunderskud på 300-500 kalorier om dagen vil resultere i et gradvist og sundt vægttab.",
            },
          },
          {
            "@type": "Question",
            name: "Er kalorieberegneren præcis?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Kalorieberegneren giver et godt estimat baseret på videnskabeligt anerkendte formler. Individuelle forskelle kan dog påvirke dit faktiske kaloriebehov.",
            },
          },
        ],
      };
    } else if (calculatorType === "rm") {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Hvorfor er det en fordel at kende sin 1RM?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "At kende sin 1RM gør det nemmere at planlægge træning, vælge passende belastning og undgå både under- og overtræning. Det giver dig et objektivt udgangspunkt, så du kan strukturere progression og måle forbedringer over tid.",
            },
          },
          {
            "@type": "Question",
            name: "Hvor ofte bør jeg opdatere min 1RM i træningen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "For de fleste er det passende at opdatere sin 1RM hver 6.–10. uge. Hvis du er ny i styrketræning, kan du opleve hurtigere fremgang og derfor justere lidt oftere. Brug FysFinders RM beregner, når du vil opdatere dit estimat.",
            },
          },
          {
            "@type": "Question",
            name: "Er min 1RM den samme i alle øvelser?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nej. Din 1RM afhænger af øvelsens kompleksitet, muskelgruppernes størrelse og din teknik i øvelsen. Mange har fx en højere 1RM i dødløft end i squat eller bænkpres. Brug FysFinders RM beregner til at beregne 1RM for hver enkelt øvelse.",
            },
          },
          {
            "@type": "Question",
            name: "Hvor præcis er en beregnet 1RM sammenlignet med en testet 1RM?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "En beregnet 1RM ligger typisk meget tæt på den reelle værdi, især hvis du bruger et moderat antal gentagelser (3–8 reps). Variation kan dog opstå pga. teknik, dagsform, søvn og erfaring. FysFinders RM beregner giver et stabilt estimat, du trygt kan planlægge efter.",
            },
          },
          {
            "@type": "Question",
            name: "Kan jeg beregne min 1RM uden at løfte tungt?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Ja. Det er netop fordelen ved en RM beregner. Du kan bruge en vægt, du kan løfte flere gange (fx 5–10 reps), og lade FysFinders RM beregner omregne det til et sikkert 1RM-estimat.",
            },
          },
          {
            "@type": "Question",
            name: "Er 1RM kun relevant for styrkeløftere?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Nej. Alle der styrketræner kan have gavn af at kende deres 1RM, uanset om målet er muskelopbygning, vægttab, sportspræstation, genoptræning eller skadesforebyggelse. Det giver bedre træningskontrol og et tydeligt mål for udvikling.",
            },
          },
        ],
      };
    }
    return null;
  };

  const faqSchema = getFAQSchema();

  // Calculator-specific schema
  const calculatorSchema =
    toolType === "calculator"
      ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name,
          description,
          applicationCategory: "CalculatorApplication",
          applicationSubCategory:
            calculatorType === "bmi"
              ? "BMI Calculator"
              : calculatorType === "calorie"
              ? "Calorie Calculator"
              : calculatorType === "rm"
              ? "RM Calculator"
              : "Calculator",
          operatingSystem: "Web",
          permissions: "none",
          isAccessibleForFree: true,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "DKK",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "150",
            bestRating: "5",
            worstRating: "1",
          },
        }
      : null;

  // Schema for the overview page
  const overviewSchema =
    type === "overview" && tools
      ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name,
          description,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: tools.map((tool, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "WebApplication",
                name: tool.title,
                description: tool.description,
                applicationCategory: "HealthApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "DKK",
                  availability: "https://schema.org/InStock",
                },
                provider: {
                  "@type": "Organization",
                  name: "FysFinder",
                },
                image: `${baseUrl}${tool.imageUrl}`,
                url: `${baseUrl}${tool.href}`,
              },
            })),
          },
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {webAppSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {calculatorSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
        />
      )}
      {overviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(overviewSchema) }}
        />
      )}
    </>
  );
}
