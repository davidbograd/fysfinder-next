"use client";

interface Props {
  cityName: string;
  clinics: Array<{
    klinikNavn: string;
    postnummer: string;
  }>;
}

export function LocationStructuredData({ cityName, clinics }: Props) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `Fysioterapeuter i ${cityName}`,
    description: `Find og sammenlign fysioterapeuter i ${cityName}. Se anmeldelser, specialer, priser og book tid online.`,
    about: {
      "@type": "MedicalBusiness",
      medicalSpecialty: "Physical Therapy",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: clinics.map((clinic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "MedicalBusiness",
          name: clinic.klinikNavn,
          address: {
            "@type": "PostalAddress",
            addressLocality: cityName,
            postalCode: clinic.postnummer,
          },
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
