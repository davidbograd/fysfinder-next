import Link from "next/link";

interface ContentTerm {
  slug: string;
  title: string;
}

interface ContentListProps {
  terms: ContentTerm[];
  baseUrl: string; // New prop to make the component more flexible
}

// Danish alphabet order helper
function getDanishAlphabetOrder(letter: string): number {
  const upperLetter = letter.toUpperCase();

  // Special handling for Danish letters to place them after Z
  switch (upperLetter) {
    case "Æ":
      return 100; // After Z (90)
    case "Ø":
      return 101;
    case "Å":
      return 102;
    default:
      return upperLetter.charCodeAt(0);
  }
}

export function ContentList({ terms, baseUrl }: ContentListProps) {
  // Group terms by first letter
  const groupedTerms = terms.reduce((acc, term) => {
    const firstLetter = term.title[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {} as Record<string, ContentTerm[]>);

  // Sort entries according to Danish alphabet
  const sortedEntries = Object.entries(groupedTerms).sort(
    ([a], [b]) => getDanishAlphabetOrder(a) - getDanishAlphabetOrder(b)
  );

  return (
    <div>
      {/* Alphabetical Index */}
      <div className="mb-8 flex flex-wrap gap-2 justify-center border-b pb-4">
        {sortedEntries.map(([letter]) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="min-w-[32px] text-center px-2 py-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors font-medium text-sm"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Content Entries */}
      {sortedEntries.map(([letter, terms]) => (
        <div
          key={letter}
          id={`letter-${letter}`}
          className="mb-12 scroll-mt-20 sm:scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
            {letter}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-2">
            {terms.map((term) => (
              <Link
                key={term.slug}
                href={`${baseUrl}/${term.slug}`}
                className="text-logo-blue hover:underline truncate"
              >
                {term.title}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
