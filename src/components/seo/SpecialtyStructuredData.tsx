"use client";

interface Props {
  cityName: string;
  specialtyName: string;
  clinics: Array<{
    klinikNavn: string;
    postnummer: string;
  }>;
}

export function SpecialtyStructuredData({
  cityName,
  specialtyName,
  clinics,
}: Props) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `${specialtyName} fysioterapeuter i ${cityName}`,
    description: `Find ${specialtyName.toLowerCase()} fysioterapeuter i ${cityName}. Se anmeldelser, priser og book tid online.`,
    about: {
      "@type": "MedicalBusiness",
      medicalSpecialty: ["Physical Therapy", specialtyName],
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: clinics.map((clinic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "MedicalBusiness",
          name: clinic.klinikNavn,
          medicalSpecialty: specialtyName,
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
