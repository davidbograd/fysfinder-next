interface AboutUsStructuredDataProps {
  founders: Array<{
    name: string;
    role: string;
    linkedinUrl: string;
  }>;
}

export function AboutUsStructuredData({
  founders,
}: AboutUsStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
      "@type": "Organization",
      "@id": "https://fysfinder.dk",
      name: "FysFinder",
      url: "https://fysfinder.dk",
      logo: "https://fysfinder.dk/logo.png",
      description: "Danmarks platform til at finde fysioterapeuter",
      foundingDate: "2023",
      founders: founders.map((founder) => ({
        "@type": "Person",
        name: founder.name,
        jobTitle: founder.role,
        sameAs: founder.linkedinUrl,
      })),
      knowsAbout: [
        "Fysioterapi",
        "Sundhedsplatform",
        "Patientbehandling",
        "Klinikadministration",
      ],
      slogan: "Find den bedste fysioterapeut tæt på dig",
      ethicsPolicy: {
        "@type": "CreativeWork",
        name: "FN's verdensmål #3",
        url: "https://www.verdensmaalene.dk/maal/3",
      },
      mission:
        "Forbind mennesker med den rette fysioterapeut til deres specifikke behov, og understøt lokale klinikker ved at øge deres synlighed og patientflow.",
      areaServed: {
        "@type": "Country",
        name: "Denmark",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
