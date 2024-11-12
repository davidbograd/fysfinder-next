import { Clinic } from "../types";

interface SuburbStructuredDataProps {
  clinics: Clinic[];
  suburbName: string;
}

export function SuburbStructuredData({
  clinics,
  suburbName,
}: SuburbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: clinics
      .map((clinic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "MedicalBusiness",
          "@id": `https://fysfinder.dk/${
            clinic.lokationSlug
          }/${clinic.klinikNavn.toLowerCase().replace(/ /g, "-")}`,
          medicalSpecialty: "PhysicalTherapy",
          name: clinic.klinikNavn,
          address: {
            "@type": "PostalAddress",
            streetAddress: clinic.adresse,
            postalCode: clinic.postnummer.toString(),
            addressLocality: clinic.lokation,
            addressCountry: "DK",
          },
          aggregateRating:
            clinic.ratingCount > 0
              ? {
                  "@type": "AggregateRating",
                  ratingValue: clinic.avgRating,
                  reviewCount: clinic.ratingCount,
                }
              : undefined,
          url: `https://fysfinder.dk/${clinic.lokationSlug}/${clinic.klinikNavn
            .toLowerCase()
            .replace(/ /g, "-")}`,
        },
      }))
      .filter((item) => item.item.aggregateRating !== undefined),
    numberOfItems: clinics.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    name: `Fysioterapeuter i ${suburbName}`,
    description: `Liste over ${clinics.length} fysioterapiklinikker i ${suburbName}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
