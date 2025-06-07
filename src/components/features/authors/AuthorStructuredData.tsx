import { Author } from "@/lib/authors";

interface AuthorStructuredDataProps {
  author: Author;
}

export function AuthorStructuredData({ author }: AuthorStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    givenName: author.givenName,
    familyName: author.familyName,
    jobTitle: author.jobTitle,
    description: author.description,
    url: `https://fysfinder.dk/forfatter/${author.slug}`,
    image: `https://fysfinder.dk${author.image}`,
    ...(author.linkedinUrl && { sameAs: [author.linkedinUrl] }),
    alumniOf: {
      "@type": "EducationalOrganization",
      name: author.education.institution,
      ...(author.education.institutionUrl && {
        url: author.education.institutionUrl,
      }),
    },
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        name: author.education.degree,
        credentialCategory: "degree",
        educationalLevel: "Bachelor",
        recognizedBy: {
          "@type": "EducationalOrganization",
          name: author.education.institution,
        },
      },
    ],
    knowsAbout: author.knowsAbout,
    expertise: author.expertise.map((exp) => ({
      "@type": "Thing",
      name: exp,
    })),
    affiliation: author.affiliations.map((aff) => ({
      "@type": aff.type,
      name: aff.name,
      ...(aff.url && { url: aff.url }),
      ...(aff.description && { description: aff.description }),
    })),
    ...(author.isFounder && {
      founder: {
        "@type": "MedicalOrganization",
        name: "FysFinder",
        url: "https://fysfinder.dk",
      },
    }),
    hasOccupation: {
      "@type": "Occupation",
      name: "Fysioterapeut",
      occupationLocation: {
        "@type": "Country",
        name: "Danmark",
      },
      skills: [
        "Muskuloskeletal fysioterapi",
        "Smertebehandling",
        "Træning",
        "Patientkommunikation",
        "Sundhedsfaglig skrivning",
      ],
    },
    workExample: author.workExamples.map((work) => ({
      "@type": "CreativeWork",
      name: work.name,
      url: work.url,
      description: work.description,
    })),
    ...(author.memberOf && {
      memberOf: {
        "@type": "ProfessionalService",
        name: author.memberOf.name,
        description: author.memberOf.description,
      },
    }),
    ...(author.awards &&
      author.awards.length > 0 && {
        award: author.awards[0],
      }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
