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
  calculatorType?: "bmi" | "calorie" | "other";
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

  // HowTo schema for calculator tools
  const howToSchema =
    toolType === "calculator"
      ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `Sådan bruger du ${name}`,
          description: `Trin-for-trin guide til at bruge ${name}`,
          step: [
            {
              "@type": "HowToStep",
              name: "Indtast dine oplysninger",
              text:
                calculatorType === "bmi"
                  ? "Indtast din vægt i kg og højde i cm"
                  : calculatorType === "calorie"
                  ? "Indtast din vægt, højde, alder og vælg dit køn"
                  : "Besvar spørgsmålene om din alder, stress, søvn, kost og motion",
            },
            ...(calculatorType === "calorie"
              ? [
                  {
                    "@type": "HowToStep",
                    name: "Vælg aktivitetsniveau",
                    text: "Vælg dit daglige aktivitetsniveau fra dropdownmenuen",
                  },
                ]
              : []),
            {
              "@type": "HowToStep",
              name: "Beregn resultat",
              text: `Klik på 'Beregn ${
                calculatorType === "bmi"
                  ? "BMI"
                  : calculatorType === "calorie"
                  ? "kalorier"
                  : "hormonbalance"
              }' knappen`,
            },
            {
              "@type": "HowToStep",
              name: "Se dit resultat",
              text:
                calculatorType === "bmi"
                  ? "Se dit BMI-tal og vægtklassifikation med forklaringer"
                  : calculatorType === "calorie"
                  ? "Se dit BMR, TDEE og anbefalinger til vægttab/vægtøgning"
                  : "Se din hormonbalance score og få personlige anbefalinger til forbedring",
            },
          ],
          totalTime: "PT2M",
          tool: {
            "@type": "WebApplication",
            name,
          },
        }
      : null;

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
    } else if (calculatorType === "other" && name.includes("Hormonbalance")) {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Hvad er hormonbalance?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Hormonbalance er en tilstand, hvor kroppens hormoner som østrogen, progesteron, kortisol og skjoldbruskkirtelhormoner er i den rette mængde og fungerer optimalt sammen.",
            },
          },
          {
            "@type": "Question",
            name: "Hvad er symptomer på hormonel ubalance?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Typiske symptomer inkluderer uregelmæssig menstruation, træthed, humørsvingninger, vægtøgning, søvnproblemer, hårtab og uren hud.",
            },
          },
          {
            "@type": "Question",
            name: "Er hormonbalance beregneren præcis?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Beregneren giver en indikation baseret på livsstilsfaktorer og symptomer, men erstatter ikke professionel medicinsk rådgivning. Konsulter altid en læge ved mistanke om hormonelle problemer.",
            },
          },
          {
            "@type": "Question",
            name: "Hvordan kan jeg forbedre min hormonbalance?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Du kan påvirke din hormonbalance positivt med tilstrækkelig søvn (7-8 timer), stressreduktion, balanceret kost, regelmæssig motion og ved at undgå for meget koffein og sukker.",
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
              : "Hormone Balance Calculator",
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
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
