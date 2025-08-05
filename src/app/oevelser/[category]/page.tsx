import { getExerciseBySlug } from "@/lib/exercises";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

interface ExercisePageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({
  params,
}: ExercisePageProps): Promise<Metadata> {
  const { category } = await params;
  const exercise = getExerciseBySlug(category);

  if (!exercise) {
    return {
      title: "Øvelse ikke fundet",
    };
  }

  return {
    title: `${exercise.title} | FysFinder`,
    description: `Find effektive træningsøvelser til ${exercise.title.toLowerCase()}. Lær hvordan du styrker dine muskler og forbedrer din mobilitet.`,
  };
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const { category } = await params;
  const exercise = getExerciseBySlug(category);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <article className="prose max-w-none">
          <MDXRemote source={exercise.content} />
        </article>
      </div>
    </div>
  );
}
