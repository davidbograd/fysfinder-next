// Added: 2026-04-06 - Added landing-page FAQ section using accordion with h3 question headings.
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "Er det virkelig gratis at oprette sin klinik på Fysfinder?",
    answer:
      "Ja. Det er 100% gratis at oprette og verificere din klinik på Fysfinder. Du kan til enhver tid vælge at opgradere til Premium, men det er helt frivilligt og uden binding.",
  },
  {
    question: "Hvor mange patienter kan jeg forvente?",
    answer:
      "Det afhænger af dit område, din profil og hvor mange patienter der søger. Mange klinikker oplever løbende nye henvendelser gennem Fysfinder, og en stærk profil kan øge din synlighed yderligere.",
  },
  {
    question: "Hvor lang tid tager det at oprette sig?",
    answer:
      "Det tager under 2 minutter at oprette din klinik, og du kan være live inden for 24 timer.",
  },
  {
    question: "Skal jeg selv gøre noget efter oprettelse?",
    answer:
      "Nej. Når din profil er oprettet, bliver du automatisk synlig for patienter, der søger i dit område.",
  },
  {
    question: "Hvordan kontakter patienter mig?",
    answer:
      "Patienter kan kontakte dig direkte via din profil, hvor de finder dine kontaktoplysninger og kan gå videre til din hjemmeside.",
  },
  {
    question: "Hvordan får jeg flere patienter som fysioterapeut?",
    answer:
      "En effektiv måde er at blive synlig der, hvor patienter aktivt søger. Fysfinder samler patienter, der leder efter fysioterapi i deres lokalområde, og gør det nemt for dem at finde din klinik.",
  },
  {
    question: "Hvordan bliver min klinik fundet på Google?",
    answer:
      "Fysfinder arbejder med SEO og synlighed på Google, så patienter lettere finder fysioterapeuter gennem platformen - uden at du selv skal bruge tid på annoncer eller SEO.",
  },
];

export function FaqSection() {
  return (
    <section className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(260px,420px)_1fr] lg:gap-24">
          <div className="self-start lg:sticky lg:top-24">
            <h2 className="text-[40px] leading-tight font-semibold text-[#1f2b28]">
              Fysfinder FAQ
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-[24px] leading-snug font-medium">
                  <h3>{item.question}</h3>
                </AccordionTrigger>
                <AccordionContent className="text-left text-gray-700 text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
