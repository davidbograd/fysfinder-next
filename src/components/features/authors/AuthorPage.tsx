import { Author, getAllAuthors } from "@/lib/authors";
import { AuthorStructuredData } from "./AuthorStructuredData";
import Image from "next/image";
import Link from "next/link";

interface AuthorPageProps {
  author: Author;
}

export function AuthorPage({ author }: AuthorPageProps) {
  const allAuthors = getAllAuthors();
  const otherAuthors = allAuthors.filter((a) => a.slug !== author.slug);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <AuthorStructuredData author={author} />
      <div className="space-y-8 mt-6">
        <header>
          <div className="mb-6">
            <Image
              src={author.image}
              alt={`${author.name} - ${author.jobTitle.join(", ")}`}
              width={200}
              height={200}
              className="rounded-full shadow-lg"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Om {author.name}</h1>
            <div className="space-y-1 mb-4">
              {author.jobTitle.map((title, index) => (
                <p key={index} className="text-xl text-gray-600">
                  {title}
                </p>
              ))}
            </div>
            <p className="text-xl text-gray-600 mb-4">
              {author.education.degree} fra {author.education.institution}
            </p>
          </div>
        </header>

        <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-logo-blue">
          <p className="text-gray-600 mb-4">
            Læs {author.givenName}s artikler på FysFinder
          </p>
          <div className="space-y-2">
            <div>
              <a
                href="/blog"
                className="text-logo-blue hover:underline text-lg"
              >
                Se blog artikler
              </a>
            </div>
            {author.slug === "joachim-bograd" && (
              <div>
                <a
                  href="/ordbog"
                  className="text-logo-blue hover:underline text-lg"
                >
                  Se ordbogen
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="space-y-6 text-lg leading-relaxed">
            {author.bio.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {otherAuthors.length > 0 && (
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">
              Andre forfattere på FysFinder
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {otherAuthors.map((otherAuthor) => (
                <Link
                  key={otherAuthor.slug}
                  href={`/forfatter/${otherAuthor.slug}`}
                  className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={otherAuthor.image}
                      alt={otherAuthor.name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {otherAuthor.name}
                      </h3>
                      <div className="space-y-1 mb-2">
                        {otherAuthor.jobTitle.map((title, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            {title}
                          </p>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        {otherAuthor.education.degree} fra{" "}
                        {otherAuthor.education.institution}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
