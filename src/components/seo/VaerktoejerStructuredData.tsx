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
}

export default function VaerktoejerStructuredData({
  type,
  name,
  description,
  breadcrumbs,
  tools,
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

  // Schema for individual tool pages
  const webAppSchema =
    type === "tool"
      ? {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name,
          description,
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
      {overviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(overviewSchema) }}
        />
      )}
    </>
  );
}
