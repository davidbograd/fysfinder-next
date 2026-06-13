import {
  DEFINED_TERM_SET_ID,
  STYRKEOEVELSER_PATH,
  STYRKEOEVELSER_SITE_URL,
  toAbsoluteSiteUrl,
} from "@/lib/styrkeoevelser";
import { getAuthorForStructuredData } from "@/lib/authors";
import { getYoutubePosterImageUrl } from "@/components/features/styrkeoevelser/youtube";

const publisher = {
  "@type": "Organization" as const,
  name: "Fysfinder",
  url: STYRKEOEVELSER_SITE_URL,
};

function breadcrumbSchema(
  items: Array<{ text: string; link?: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        ...(item.link
          ? { "@id": `${STYRKEOEVELSER_SITE_URL}${item.link}` }
          : {}),
        name: item.text,
      },
    })),
  };
}

type HubProps = {
  name: string;
  description: string;
  definedTerms: Array<{ name: string; url: string; description: string }>;
};

export function StyrkeoevelserHubStructuredData({
  name,
  description,
  definedTerms,
}: HubProps) {
  const hubUrl = `${STYRKEOEVELSER_SITE_URL}${STYRKEOEVELSER_PATH}`;
  const graph: Record<string, unknown>[] = [
    breadcrumbSchema([
      { text: "Forside", link: "/" },
      { text: "Styrkeøvelser", link: STYRKEOEVELSER_PATH },
    ]),
    {
      "@type": ["WebPage", "CollectionPage"],
      "@id": `${hubUrl}#webpage`,
      url: hubUrl,
      name,
      description,
      publisher,
      about: {
        "@type": "MedicalSpecialty",
        name: "Fysioterapi",
      },
    },
    {
      "@type": "DefinedTermSet",
      "@id": DEFINED_TERM_SET_ID,
      name,
      url: hubUrl,
      description,
      hasDefinedTerm: definedTerms.map((t) => ({
        "@type": "DefinedTerm",
        name: t.name,
        description: t.description,
        url: t.url,
      })),
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

type BodyPartProps = {
  title: string;
  description: string;
  slug: string;
  exerciseUrls: Array<{ name: string; url: string; description: string }>;
};

export function StyrkeoevelserBodyPartStructuredData({
  title,
  description,
  slug,
  exerciseUrls,
}: BodyPartProps) {
  const hubUrl = `${STYRKEOEVELSER_SITE_URL}${STYRKEOEVELSER_PATH}`;
  const pageUrl = `${STYRKEOEVELSER_SITE_URL}${STYRKEOEVELSER_PATH}/${slug}`;
  const subsetId = `${pageUrl}#defined-term-subset`;

  const graph = [
    breadcrumbSchema([
      { text: "Forside", link: "/" },
      { text: "Styrkeøvelser", link: STYRKEOEVELSER_PATH },
      { text: title },
    ]),
    {
      "@type": ["WebPage", "CollectionPage"],
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `${title} – styrkeøvelser`,
      description,
      publisher,
      isPartOf: { "@id": `${hubUrl}#webpage` },
    },
    {
      "@type": "DefinedTermSet",
      "@id": subsetId,
      name: `${title} – øvelser`,
      url: pageUrl,
      isPartOf: { "@id": DEFINED_TERM_SET_ID },
      hasDefinedTerm: exerciseUrls.map((t) => ({
        "@type": "DefinedTerm",
        name: t.name,
        description: t.description,
        url: t.url,
      })),
    },
    {
      "@type": "ItemList",
      name: `Øvelser for ${title}`,
      numberOfItems: exerciseUrls.length,
      itemListElement: exerciseUrls.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "DefinedTerm",
          name: t.name,
          url: t.url,
        },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}

type ExerciseProps = {
  exercise: {
    slug: string;
    title: string;
    description: string;
    content: string;
    lastUpdated: string;
    datePublished: string;
    author?: string;
    videoUrl?: string;
    videoName?: string;
    videoThumbnailUrl?: string;
    previewImage?: string;
    previewImageAlt?: string;
  };
};

export function StyrkeoevelserExerciseStructuredData({
  exercise,
}: ExerciseProps) {
  const pageUrl = `${STYRKEOEVELSER_SITE_URL}${STYRKEOEVELSER_PATH}/${exercise.slug}`;
  const authorData =
    getAuthorForStructuredData(exercise.author ?? "joachim-bograd") ?? undefined;

  const previewAbs = exercise.previewImage
    ? toAbsoluteSiteUrl(exercise.previewImage)
    : undefined;

  const webPage: Record<string, unknown> = {
    "@type": ["WebPage", "MedicalWebPage"],
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: exercise.title,
    headline: exercise.title,
    description: exercise.description,
    dateModified: exercise.lastUpdated,
    datePublished: exercise.datePublished,
    author: authorData,
    publisher,
    specialty: "Fysioterapi",
    medicalAudience: "Patienter og sundhedsinteresserede",
    about: {
      "@type": "MedicalSpecialty",
      name: "Fysioterapi",
    },
    mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
  };

  if (previewAbs) {
    webPage.primaryImageOfPage = {
      "@type": "ImageObject",
      url: previewAbs,
      caption: exercise.previewImageAlt ?? exercise.title,
    };
  }

  const graph: Record<string, unknown>[] = [
    breadcrumbSchema([
      { text: "Forside", link: "/" },
      { text: "Styrkeøvelser", link: STYRKEOEVELSER_PATH },
      { text: exercise.title },
    ]),
    webPage,
    {
      "@type": "DefinedTerm",
      name: exercise.title,
      description: exercise.description,
      url: pageUrl,
      inDefinedTermSet: { "@id": DEFINED_TERM_SET_ID },
    },
  ];

  if (exercise.videoUrl) {
    const thumbnailFromYoutube = getYoutubePosterImageUrl(exercise.videoUrl);
    const thumbnailUrl =
      exercise.videoThumbnailUrl ?? thumbnailFromYoutube ?? undefined;

    const video: Record<string, unknown> = {
      "@type": "VideoObject",
      name: exercise.videoName ?? exercise.title,
      description: exercise.description,
      uploadDate: exercise.datePublished,
      contentUrl: exercise.videoUrl,
    };

    if (thumbnailUrl) {
      video.thumbnailUrl = thumbnailUrl;
    }

    if (
      exercise.videoUrl.includes("youtube.com") ||
      exercise.videoUrl.includes("youtu.be")
    ) {
      const id =
        exercise.videoUrl.match(/[?&]v=([^&]+)/)?.[1] ??
        exercise.videoUrl.match(/youtu\.be\/([^?]+)/)?.[1];
      if (id) {
        video.embedUrl = `https://www.youtube.com/embed/${id}`;
      }
    }
    graph.push(video);
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
