import { City, Clinic } from "@/app/types";
import { slugify } from "@/app/utils/slugify";

export interface LocationStructuredDataProps {
  city?: City | null;
  clinics: Clinic[];
  specialtyName?: string | null;
  isDanmarkPage?: boolean;
}

export function LocationStructuredData({
  city,
  clinics,
  specialtyName,
  isDanmarkPage = false,
}: LocationStructuredDataProps) {
  const baseUrl = "https://www.fysfinder.dk";
  const locationPath = isDanmarkPage
    ? "/find/fysioterapeut/danmark"
    : `/find/fysioterapeut/${city?.bynavn_slug}`;
  const specialtyPath = specialtyName ? `/${slugify(specialtyName)}` : "";
  const currentUrl = `${baseUrl}${locationPath}${specialtyPath}`;

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: isDanmarkPage
      ? specialtyName
        ? `Fysioterapeuter i Danmark specialiseret i ${specialtyName}`
        : "Find og sammenlign fysioterapeuter i Danmark"
      : specialtyName
      ? `Fysioterapeuter i ${city?.bynavn} specialiseret i ${specialtyName}`
      : `Fysioterapeuter i ${city?.bynavn}`,
    url: currentUrl,

    about: {
      "@type": "MedicalSpecialty",
      name: specialtyName || "Fysioterapi",
      relevantSpecialty: {
        "@type": "MedicalSpecialty",
        name: "Physical Therapy",
      },
    },
    specialty: specialtyName || "Fysioterapi",
    medicalAudience: "Patienter der søger fysioterapi",

    // Location/Area Served (only for city pages)
    ...(city && {
      areaServed: {
        "@type": "City",
        name: city.bynavn,
        geo: {
          "@type": "GeoCoordinates",
          latitude: city.latitude,
          longitude: city.longitude,
        },
      },
    }),

    // List of Clinics
    mainEntity: {
      "@type": "ItemList",
      itemListElement: clinics.map((clinic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": ["LocalBusiness", "MedicalBusiness"],
          name: clinic.klinikNavn,
          url: `${baseUrl}/klinik/${clinic.klinikNavnSlug}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: clinic.lokation,
            postalCode: clinic.postnummer,
            streetAddress: clinic.adresse,
            addressCountry: "DK",
          },
          ...(clinic.avgRating && clinic.ratingCount > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: clinic.avgRating,
                  reviewCount: clinic.ratingCount,
                  bestRating: 5,
                  worstRating: 1,
                },
              }
            : {}),
          medicalSpecialty: [
            "Physical Therapy",
            ...clinic.specialties.map((s) => s.specialty_name),
          ],
        },
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Forside",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isDanmarkPage ? "Danmark" : city?.bynavn,
        item: `${baseUrl}${locationPath}`,
      },
      ...(specialtyName
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: specialtyName,
              item: currentUrl,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
