import { GlossaryEntry } from "@/components/GlossaryEntry";
import { getGlossaryTerm, getGlossaryTerms } from "@/lib/glossary";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";

export async function generateStaticParams() {
  const terms = await getGlossaryTerms();
  return terms.map((term) => ({
    term: term.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { term: string };
}) {
  const term = await getGlossaryTerm(params.term);
  return {
    title: `${term.title} | Fysioterapeut Artikler`,
    description: `Lær mere om ${term.title} i vores fysioterapeut artikler.`,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { term: string };
}) {
  const term = await getGlossaryTerm(params.term);

  const breadcrumbItems = [
    { text: "Artikler", link: "/fysioterapeut-artikler" },
    { text: term.title },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {" "}
        {/* Added this wrapper div */}
        <Breadcrumbs items={breadcrumbItems} />
        <GlossaryEntry term={term} />
      </div>
    </div>
  );
}
