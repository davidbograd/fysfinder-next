import Link from "next/link";

interface GlossaryTerm {
  slug: string;
  title: string;
}

interface GlossaryListProps {
  terms: GlossaryTerm[];
}

export function GlossaryList({ terms }: GlossaryListProps) {
  const groupedTerms = terms.reduce((acc, term) => {
    const firstLetter = term.title[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  return (
    <div>
      {Object.entries(groupedTerms).map(([letter, terms]) => (
        <div key={letter} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{letter}</h2>
          <ul className="space-y-2">
            {terms.map((term) => (
              <li key={term.slug}>
                <Link
                  href={`/fysioterapeut-artikler/${term.slug}`}
                  className="text-logo-blue hover:underline"
                >
                  {term.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
