// Added: 2026-04-06 - Added testimonial social proof section based on new landing-page brief.
const testimonials = [
  {
    quote:
      "Vi havde ofte huller i kalenderen - især i starten af ugen. Efter vi kom på Fysfinder, får vi løbende nye patienter ind uden at gøre noget ekstra.",
    author: "Klinikejer, København",
  },
  {
    quote:
      "Jeg har aldrig haft lyst til at bruge tid på marketing. Fysfinder er nok det nemmeste jeg har gjort - og det giver faktisk patienter.",
    author: "Selvstændig fys, Aarhus",
  },
  {
    quote:
      "Vi får typisk 2-3 nye patienter om måneden via Fysfinder. Det er hurtigt et par tusinde kroner ekstra - uden ekstra arbejde.",
    author: "Klinikejer, Aalborg",
  },
  {
    quote:
      "Vi bliver fundet af patienter i vores område, som vi ellers ikke ville have nået. Det har gjort en klar forskel for vores klinik.",
    author: "Fysioterapeut, Odense",
  },
  {
    quote:
      "Det føles rart at bruge en platform, der er lavet af en fysioterapeut. Det er simpelt, relevant - og virker i praksis.",
    author: "Selvstændig fys, Roskilde",
  },
];

export function TestimonialsSection() {
  return (
    <section className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
            Hvorfor fysioterapeuter elsker Fysfinder
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.quote}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6"
            >
              <p className="mb-4 text-gray-700">"{item.quote}"</p>
              <p className="text-sm font-medium text-gray-500">- {item.author}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
