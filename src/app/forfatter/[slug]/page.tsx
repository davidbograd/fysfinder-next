import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthor, getAllAuthors } from "@/lib/authors";
import { AuthorPage } from "@/components/features/authors/AuthorPage";

interface AuthorPageParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const authors = getAllAuthors();
  return authors.map((author) => ({
    slug: author.slug,
  }));
}

export async function generateMetadata({
  params,
}: AuthorPageParams): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);

  if (!author) {
    return {
      title: "Forfatter ikke fundet",
      description: "Den ønskede forfatter kunne ikke findes.",
    };
  }

  const primaryTitle = author.jobTitle.includes("Fysioterapeut")
    ? "fysioterapeut"
    : author.jobTitle[0].toLowerCase();

  return {
    title: `${author.name} | ${primaryTitle}`,
    description: `Lær mere om ${author.name}, ${author.jobTitle
      .join(", ")
      .toLowerCase()} hos FysFinder. ${author.education.degree} fra ${
      author.education.institution
    }${
      author.expertise.length > 0
        ? ` med specialer i ${author.expertise.join(", ").toLowerCase()}`
        : ""
    }.`,
  };
}

export default async function AuthorPageRoute({ params }: AuthorPageParams) {
  const { slug } = await params;
  const author = getAuthor(slug);

  if (!author) {
    notFound();
  }

  return <AuthorPage author={author} />;
}
