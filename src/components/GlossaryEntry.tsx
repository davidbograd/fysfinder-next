import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";

interface GlossaryTerm {
  slug: string;
  title: string;
  content: string;
}

export function GlossaryEntry({ term }: { term: GlossaryTerm }) {
  return (
    <article className="text-gray-800">
      <h1 className="text-4xl font-bold mb-6">{term.title}</h1>
      <div className="prose prose-lg max-w-none">
        <MDXRemote
          source={term.content}
          components={{
            h2: (props) => (
              <h2
                {...props}
                className="text-2xl font-semibold mb-4 mt-12 text-gray-800 border-b-2 border-gray-200 pb-2"
              />
            ),
            h3: (props) => (
              <h3
                {...props}
                className="text-lg font-semibold mb-1 mt-8 text-gray-800"
              />
            ),
            h4: (props) => (
              <h4 {...props} className="font-semibold mt-2 text-gray-800" />
            ),
            p: (props) => <p {...props} className="text-gray-700 mb-4" />,
            Image: (props) => (
              <div className="w-full my-8">
                <Image {...props} />
              </div>
            ),
            a: (props) => (
              <a {...props} className="text-logo-blue hover:underline" />
            ),
            ul: (props) => <ul {...props} className="list-disc pl-6 mb-4" />,
            ol: (props) => <ol {...props} className="list-decimal pl-6 mb-4" />,
            li: (props) => <li {...props} className="mb-2" />,
          }}
        />
      </div>
      <div className="mt-8">
        <Link
          href="/fysioterapeut-artikler"
          className="text-logo-blue hover:underline"
        >
          &larr; Tilbage til artikler
        </Link>
      </div>
    </article>
  );
}
