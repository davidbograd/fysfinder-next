import {
  ExerciseGridCard,
  type ExerciseGridCardData,
} from "@/components/features/styrkeoevelser/ExerciseGridCard";

type ExerciseCardsForBodyPartProps = {
  exercises: ExerciseGridCardData[];
  currentBodyPartSlug: string;
};

export const ExerciseCardsForBodyPart = ({
  exercises,
  currentBodyPartSlug,
}: ExerciseCardsForBodyPartProps) => {
  if (exercises.length === 0) {
    return (
      <p className="text-gray-600">
        Ingen øvelser med denne kropsdel endnu (placeholder).
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {exercises.map((ex) => (
        <li key={ex.slug} className="h-full">
          <ExerciseGridCard
            exercise={ex}
            highlightBodyPartSlug={currentBodyPartSlug}
          />
        </li>
      ))}
    </ul>
  );
};
