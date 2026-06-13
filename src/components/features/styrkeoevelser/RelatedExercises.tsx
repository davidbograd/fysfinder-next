import {
  ExerciseGridCard,
  type ExerciseGridCardData,
} from "@/components/features/styrkeoevelser/ExerciseGridCard";

type RelatedExercisesProps = {
  exercises: ExerciseGridCardData[];
};

export const RelatedExercises = ({ exercises }: RelatedExercisesProps) => {
  if (exercises.length === 0) {
    return null;
  }

  return (
    <section
      className="my-10"
      aria-labelledby="related-exercises-heading"
    >
      <h2
        id="related-exercises-heading"
        className="text-2xl font-semibold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2"
      >
        Relaterede øvelser
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {exercises.map((ex) => (
          <li key={ex.slug} className="h-full">
            <ExerciseGridCard exercise={ex} />
          </li>
        ))}
      </ul>
    </section>
  );
};
