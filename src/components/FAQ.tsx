import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Hvad er fysioterapi?",
    answer:
      "Fysioterapi er en sundhedsfaglig behandlingsform, der fokuserer på at forbedre bevægelighed, lindre smerter og genoprette fysisk funktion gennem øvelser, manuel behandling og rådgivning.",
  },
  {
    question: "Hvordan vælger jeg den rigtige fysioterapeut?",
    answer:
      "Vælg en fysioterapeut baseret på deres specialer, erfaring, anmeldelser og beliggenhed. FysFinder hjælper dig med at sammenligne og finde den bedste match til dine behov.",
  },
  {
    question: "Har jeg brug for en henvisning for at se en fysioterapeut?",
    answer:
      "I Danmark kan du oftest gå direkte til en fysioterapeut uden henvisning. Dog kan en lægehenvisning give dig adgang til tilskud fra den offentlige sygesikring.",
  },
  {
    question:
      "Hvad kan jeg forvente ved mit første besøg hos en fysioterapeut?",
    answer:
      "Ved dit første besøg vil fysioterapeuten typisk gennemgå din sygehistorie, foretage en fysisk undersøgelse og udarbejde en behandlingsplan tilpasset dine behov.",
  },
  {
    question: "Dækker min forsikring fysioterapi?",
    answer:
      "Mange sundhedsforsikringer dækker fysioterapi. Tjek din police eller kontakt dit forsikringsselskab for at få specifik information om din dækning.",
  },
];

export function FAQ() {
  return (
    <section className="mb-12 mt-16">
      <h2 className="text-2xl font-bold mb-4">Ofte stillede spørgsmål</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-gray-700 text-base">{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
