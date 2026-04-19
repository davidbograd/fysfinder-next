import { TilmeldSignupFeatureCardsGrid } from "./TilmeldSignupFeatureCardsGrid";

export function FeaturesSection() {
  return (
    <section id="features" className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-3">
          <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
            Kom i gang med Fysfinder - helt gratis
          </h2>
          <p className="max-w-3xl text-gray-600">
            Fysfinder gør din fysioterapeutklinik synlig, når patienter søger
            efter fysioterapi i dit område.
          </p>
        </div>

        <TilmeldSignupFeatureCardsGrid />
      </div>
    </section>
  );
}
