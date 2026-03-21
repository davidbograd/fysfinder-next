// Updated: 2026-03-17 - Converted FAQ section to a two-column homepage layout with left intro and right accordion list
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableData {
  headers: string[];
  rows: string[][];
}

interface FAQItem {
  question: string;
  answer?: string;
  table?: TableData;
  list?: string[];
}

const faqItems: FAQItem[] = [
  {
    question: "Hvad er fysioterapi?",
    answer:
      "Fysioterapi er en sundhedsfaglig behandlingsform, der har til formål at genoprette eller forbedre kroppens funktionsevne og bevægelighed. Det anvendes ofte ved skader, smerter, nedsat bevægelsesfunktion eller som forebyggelse mod fremtidige gener. Behandlingen kan bestå af øvelser, manuelle teknikker, massage og rådgivning.",
  },
  {
    question: "Hvad hjælper en fysioterapeut med?",
    answer:
      "En fysioterapeut undersøger, diagnosticerer og behandler problemer i muskler, led og nervesystemet. De arbejder med at forbedre patienters fysiske funktion og reducere smerte gennem øvelser, manuel behandling og vejledning i livsstil og ergonomi.",
  },
  {
    question: "Er det billigere at gå til fysioterapi med henvisning?",
    answer:
      "Ja, du kan få tilskud fra det offentlige, hvis du har en henvisning fra din læge. Det dækker cirka 40% af behandlingsprisen.",
    table: {
      headers: ["Med eller uden henvisning", "Typisk egenbetaling"],
      rows: [
        ["Med henvisning", "180-230 kr."],
        ["Uden henvisning", "300-700 kr."],
      ],
    },
  },
  {
    question: "Hvem kan få gratis fysioterapi?",
    answer:
      "Gratis (vederlagsfri) fysioterapi gives til personer med visse kroniske sygdomme, handicap eller funktionsnedsættelser. Det kræver en henvisning fra lægen og en godkendelse fra kommunen eller regionen.",
  },
  {
    question: "Hvornår skal man gå til fysioterapeut?",
    answer: "Du bør overveje at gå til en fysioterapeut ved:",
    list: [
      "Vedvarende smerter i muskler og led",
      "Genoptræning efter operation eller skade",
      "Nedsat bevægelighed eller styrke",
      "Forebyggelse af arbejdsrelaterede skader",
      "Kroniske sygdomme som gigt, sclerose eller parkinson",
    ],
  },
  {
    question: "Kan pensionister få tilskud til fysioterapi?",
    answer:
      'Ja, pensionister har ret til tilskud via det offentlige, og hvis de opfylder kriterierne, kan de også få vederlagsfri fysioterapi. Sygeforsikringen "danmark" giver også tilskud.',
  },
  {
    question: "Hvad er forskellen på fysioterapeut og fysioterapi?",
    answer:
      "Fysioterapi er selve behandlingen og metoden. Fysioterapeut er den fagperson, der udfører behandlingen.",
    table: {
      headers: ["Begreb", "Betydning"],
      rows: [
        ["Fysioterapi", "Behandlingsmetoder og teknikker"],
        ["Fysioterapeut", "Uddannet sundhedsperson, der udfører terapien"],
      ],
    },
  },
  {
    question: "Hvilke diagnoser giver ret til vederlagsfri fysioterapi?",
    answer: "Eksempler på diagnoser:",
    list: [
      "Multipel sklerose (MS)",
      "Parkinsons sygdom",
      "Apopleksi (blodprop i hjernen)",
      "Rygmarvsskade",
      "Medfødt cerebral parese",
      "Svær gigt",
    ],
  },
  {
    question: "Hvad skal man medbringe til fysioterapi?",
    answer: "Det er en god idé at medbringe:",
    list: [
      "Sundhedskort (sygesikringsbevis)",
      "Henvisning fra lægen (hvis du har en)",
      "Behageligt tøj og evt. sportssko",
      "Information om din skade/historik",
    ],
  },
  {
    question: "Kan egen læge henvise til fysioterapi?",
    answer:
      "Ja, din egen praktiserende læge kan udstede en henvisning til fysioterapi, hvis der er sundhedsfaglig begrundelse. Henvisningen giver dig adgang til tilskud fra det offentlige.",
  },
  {
    question: "Hvor mange gange kan man få tilskud til fysioterapi?",
    answer:
      "Der er som udgangspunkt ikke et fast loft på antal behandlinger med tilskud. Det afhænger af behov og lægens vurdering. Ved vederlagsfri fysioterapi er der typisk længere behandlingsforløb.",
  },
  {
    question: "Er fysioterapeut gratis med henvisning?",
    answer:
      "Nej, men du får tilskud fra det offentlige. Du betaler typisk 60% af prisen selv, medmindre du er berettiget til vederlagsfri fysioterapi.",
  },
  {
    question: "Hvor lang tid tager en fys behandling?",
    answer: "Behandlingstiden varierer, men typisk:",
    list: [
      "Førstegangskonsultation: 45-60 minutter",
      "Opfølgende behandling: 25-40 minutter",
    ],
  },
  {
    question: "Kan en fysioterapeut give massage?",
    answer:
      'Ja, mange fysioterapeuter bruger massage som en del af behandlingen. Det kaldes ofte "manuel behandling" og bruges til at løsne spændinger og forbedre blodcirkulationen.',
    table: {
      headers: ["Behandlingstype", "Inkluderer massage?"],
      rows: [
        ["Manuel terapi", "Ja"],
        ["Fysioterapi med øvelser", "Delvist"],
        ["Sportsfysioterapi", "Ja"],
      ],
    },
  },
];

export function FAQ() {
  const renderSeoAnswerText = (item: FAQItem) => {
    const tableText = item.table
      ? item.table.rows.map((row) => row.join(" - ")).join(" | ")
      : "";
    const listText = item.list ? item.list.join(" | ") : "";

    return [item.answer, listText, tableText].filter(Boolean).join(" ");
  };

  const renderContent = (item: FAQItem) => {
    return (
      <div className="space-y-4">
        {item.answer && (
          <p className="text-gray-700 text-base">{item.answer}</p>
        )}

        {item.list && (
          <ul className="list-disc ml-6 text-gray-700 text-base space-y-1">
            {item.list.map((listItem, index) => (
              <li key={index}>{listItem}</li>
            ))}
          </ul>
        )}

        {item.table && (
          <Table>
            <TableHeader>
              <TableRow>
                {item.table.headers.map((header, index) => (
                  <TableHead key={index}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.table.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    );
  };

  return (
    <section className="mb-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(260px,420px)_1fr] lg:gap-24">
        <div className="lg:sticky lg:top-24 self-start">
          <h2 className="text-[40px] leading-tight font-semibold text-[#1f2b28]">
            Spørgsmål og svar om fysioterapi
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-[24px] leading-snug font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-left">
                {renderContent(item)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Keep all FAQ answers always present in DOM for SEO crawling */}
      <div className="sr-only" aria-hidden="true">
        {faqItems.map((item, index) => (
          <article key={`seo-faq-${index}`}>
            <h3>{item.question}</h3>
            <p>{renderSeoAnswerText(item)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
