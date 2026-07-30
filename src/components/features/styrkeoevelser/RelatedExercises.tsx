import {
  ExerciseGridCard,
  type ExerciseGridCardData,
} from "@/components/features/styrkeoevelser/ExerciseGridCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type RelatedExercisesProps = {
  exercises: ExerciseGridCardData[];
};

export const RelatedExercises = ({ exercises }: RelatedExercisesProps) => {
  if (exercises.length === 0) {
    return null;
  }

  return (
    <section className="mt-16" aria-labelledby="related-exercises-heading">
      <Carousel opts={{ align: "start" }}>
        <div className="mb-6 flex items-center justify-between gap-4 border-b-2 border-gray-200 pb-2">
          <h2
            id="related-exercises-heading"
            className="text-2xl font-semibold text-gray-800"
          >
            Relaterede øvelser
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <CarouselPrevious className="static h-9 w-9 translate-x-0 translate-y-0" />
            <CarouselNext className="static h-9 w-9 translate-x-0 translate-y-0" />
          </div>
        </div>
        <CarouselContent>
          {exercises.map((ex) => (
            <CarouselItem
              key={ex.slug}
              className="basis-[80%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ExerciseGridCard exercise={ex} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};
