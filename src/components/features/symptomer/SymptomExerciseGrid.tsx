// Added: 2026-09-07 - Exercise grid for symptom pages. Reuses the existing ExerciseGridCard and the /styrkeoevelser data source; no exercise content is duplicated.

import Link from "next/link";
import { ExerciseGridCard } from "@/components/features/styrkeoevelser/ExerciseGridCard";
import { getSymptomExercises } from "@/lib/symptomer";
import { symptomEventAttributes } from "@/lib/symptomer/analytics";
import type { ExerciseSection } from "@/lib/symptomer/types";

interface SymptomExerciseGridProps {
  section: ExerciseSection;
  /** Highlights the matching body-part pill on each card, when it exists. */
  highlightBodyPartSlug?: string;
}

export function SymptomExerciseGrid({
  section,
  highlightBodyPartSlug,
}: SymptomExerciseGridProps) {
  const exercises = getSymptomExercises(section.exerciseSlugs);

  return (
    <>
      {exercises.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {exercises.map((exercise) => (
            <li
              key={exercise.slug}
              className="h-full"
              {...symptomEventAttributes("exercise_click", {
                exercise: exercise.slug,
                destination: `/styrkeoevelser/${exercise.slug}`,
              })}
            >
              <ExerciseGridCard
                exercise={exercise}
                highlightBodyPartSlug={highlightBodyPartSlug}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <Link
        href={section.ctaHref}
        className="mt-8 inline-flex text-[16px] font-medium text-brand-primary underline underline-offset-2 hover:text-brand-primary/80"
      >
        {section.ctaLabel}
      </Link>
    </>
  );
}
