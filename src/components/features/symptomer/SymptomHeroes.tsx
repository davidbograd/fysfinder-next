// Added: 2026-09-07 - Hero shells for the three symptom levels. Each takes its interactive content as children so cards are never hardcoded inside a hero.

interface HeroProps {
  h1: string;
  intro: string;
  children?: React.ReactNode;
}

/** Level 1 — `/symptomer`. */
export function SymptomsHero({ h1, intro, children }: HeroProps) {
  return (
    <section className="rounded-3xl bg-brand-beige p-6 sm:p-10">
      <h1 className="max-w-4xl text-balance text-[34px] leading-tight tracking-tight text-[#1f2b28] sm:text-[44px] md:text-[56px] md:leading-[1.08]">
        {h1}
      </h1>
      <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-[#3f4b48] md:text-[20px]">
        {intro}
      </p>
      {children}
    </section>
  );
}

/** Level 2 — `/symptomer/{bodyArea}`. */
export function BodyPartSymptomsHero({ h1, intro, children }: HeroProps) {
  return (
    <section className="rounded-3xl bg-brand-beige p-6 sm:p-10">
      <h1 className="max-w-4xl text-balance text-[30px] leading-tight tracking-tight text-[#1f2b28] sm:text-[38px] md:text-[48px] md:leading-[1.1]">
        {h1}
      </h1>
      <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-[#3f4b48] md:text-[20px]">
        {intro}
      </p>
      {children}
    </section>
  );
}

/** Level 3 — `/symptomer/{bodyArea}/{condition}`. */
export function ConditionHero({ h1, intro, children }: HeroProps) {
  return (
    <section className="rounded-3xl bg-brand-beige p-6 sm:p-10">
      <h1 className="max-w-4xl text-balance text-[30px] leading-tight tracking-tight text-[#1f2b28] sm:text-[38px] md:text-[48px] md:leading-[1.1]">
        {h1}
      </h1>
      <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-[#3f4b48] md:text-[20px]">
        {intro}
      </p>
      {children}
    </section>
  );
}
