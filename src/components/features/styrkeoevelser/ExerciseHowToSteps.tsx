import type { ExerciseHowTo } from "@/lib/styrkeoevelser";

type ExerciseHowToStepsProps = {
  howTo: ExerciseHowTo;
};

export const ExerciseHowToSteps = ({ howTo }: ExerciseHowToStepsProps) => {
  const { heading, steps, note } = howTo;

  return (
    <section className="mt-16" aria-labelledby="how-to-heading">
      <h2
        id="how-to-heading"
        className="mb-8 border-b-2 border-gray-200 pb-2 text-2xl font-semibold text-gray-800"
      >
        {heading}
      </h2>

      <ol className="space-y-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <li key={index} className="flex gap-4">
              <div className="relative flex w-10 shrink-0 justify-center">
                <div className="z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-beige text-brand-primary">
                  <span className="text-base font-semibold">{index + 1}</span>
                </div>
                {!isLast ? (
                  <span
                    className="absolute top-10 h-[calc(100%+1rem)] w-px bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <div className="pt-2 pb-2">
                <p className="leading-relaxed text-gray-700">{step}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {note ? (
        <div className="mt-6 rounded-xl bg-brand-beige px-5 py-4">
          <p className="text-gray-800">
            <span className="font-semibold">{note.label}:</span> {note.text}
          </p>
        </div>
      ) : null}
    </section>
  );
};
