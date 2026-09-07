// Added: 2026-09-07 - Artrose i knæet condition data for the symptom universe. Long-form copy drafted to match the approved Løberknæ register and awaits editorial review.

import { CONDITION_SECTION_IDS } from "../constants";
import type { Condition } from "../types";

export const artrose: Condition = {
  slug: "artrose",
  name: "Artrose i knæet",
  bodyAreaSlug: "knae",
  isActive: true,

  metaTitle: "Artrose i knæet → Symptomer, årsager, behandling og øvelser",
  metaDescription:
    "Bliv klogere på artrose i knæet, typiske symptomer og mulige årsager. Se hvad du selv kan gøre, relevante øvelser og find en fysioterapeut.",

  h1: "Artrose i knæet – symptomer, årsager og hvad du kan gøre",
  heroIntro:
    "Artrose i knæet er forandringer i knæleddet, som blandt andet kan give smerter, stivhed og nedsat funktion. Symptomerne udvikler sig typisk gradvist over tid. Bliv klogere på symptomer, mulige årsager, hvad du selv kan gøre, og hvornår det kan være relevant at få professionel hjælp.",
  shortDescription:
    "Forandringer i knæleddet, som blandt andet kan give smerter, stivhed og nedsat funktion.",

  quickFacts: [
    {
      label: "Typisk placering",
      value: "I hele knæet, ofte på indersiden eller omkring knæskallen",
    },
    {
      label: "Opleves ofte ved",
      value: "Gang, trapper, opstart efter hvile og belastning over tid",
    },
    {
      label: "Kan blandt andet opleves som",
      value: "Smerter, morgenstivhed, hævelse og nedsat bevægelighed",
    },
    {
      label: "Relevant hjælp",
      value:
        "Træning, tilpasset belastning, vægt og eventuelt lægelig eller fysioterapeutisk vurdering",
    },
  ],

  reviewedBy: { authorSlug: "joachim-bograd", reviewDate: "2026-09-07" },

  introduction: {
    heading: "Hvad er artrose i knæet?",
    blocks: [
      {
        type: "paragraph",
        text: "Artrose i knæet – også kaldet slidgigt – er forandringer i knæleddets brusk, knogle og omkringliggende væv. Forandringerne udvikler sig typisk over tid og kan give smerter, stivhed og nedsat funktion.",
      },
      {
        type: "paragraph",
        text: "Artrose er almindeligt forekommende og betyder ikke, at knæet er slidt op eller ikke kan bruges. Mange kan være aktive med artrose i knæet, og træning er en central del af den anbefalede behandling.",
      },
    ],
  },

  symptoms: {
    heading: "Hvad er symptomerne på artrose i knæet?",
    blocks: [
      {
        type: "paragraph",
        text: "Symptomerne kan variere fra person til person og over tid. De opleves typisk i forbindelse med belastning og efter perioder med hvile.",
      },
      {
        type: "list",
        items: [
          "Smerter i knæet ved gang, trapper og længere tids belastning",
          "Stivhed i knæet, især om morgenen eller efter hvile",
          "Nedsat bevægelighed i knæet",
          "Hævelse i og omkring knæleddet",
          "Perioder med flere symptomer efterfulgt af roligere perioder",
        ],
      },
      {
        type: "paragraph",
        text: "De samme symptomer kan forekomme ved andre problemstillinger i knæet. Symptomerne kan derfor ikke alene afgøre, om der er tale om artrose.",
      },
    ],
  },

  causes: {
    heading: "Hvad skyldes artrose i knæet?",
    blocks: [
      {
        type: "paragraph",
        text: "Artrose udvikles over tid og skyldes sjældent én enkelt faktor. Både belastning gennem livet, tidligere skader, arv, alder og vægt kan have betydning for, hvordan knæleddet påvirkes.",
      },
      {
        type: "paragraph",
        text: "Årsagen bør derfor vurderes ud fra den enkelte persons historik, symptomer og aktivitetsniveau frem for én enkelt forklaring.",
      },
      { type: "subheading", text: "Typiske faktorer ved artrose i knæet" },
      {
        type: "paragraph",
        text: "Flere forhold kan have betydning for udviklingen af symptomer. Det gælder blandt andet:",
      },
      {
        type: "list",
        items: [
          "Alder og arvelige forhold",
          "Tidligere knæskader, eksempelvis meniskskade eller korsbåndsskade",
          "Længere perioder med lav fysisk aktivitet",
          "Kropsvægt og den samlede belastning af knæet",
          "Nedsat styrke i musklerne omkring knæet",
        ],
      },
    ],
  },

  selfManagement: {
    heading: "Hvad kan du gøre ved artrose i knæet?",
    blocks: [
      {
        type: "paragraph",
        text: "Ved artrose i knæet er træning og fysisk aktivitet en central del af den anbefalede behandling. Det er sjældent relevant at undgå at bruge knæet – i stedet handler det typisk om at finde en belastning, knæet kan tåle, og gradvist bygge den op.",
      },
      {
        type: "paragraph",
        text: "Afhængigt af symptomerne kan det blandt andet være relevant at arbejde med:",
      },
      {
        type: "list",
        items: [
          "Regelmæssig styrketræning af lår, baller og lægge",
          "Bevægelighedstræning for knæet",
          "Konditionstræning med lav belastning, fx cykling eller gang",
          "Gradvis progression i belastning og aktivitetsmængde",
          "Vægt og øvrig sundhed, hvis det er relevant for dig",
        ],
      },
      {
        type: "paragraph",
        text: "Det er normalt, at symptomerne varierer fra dag til dag. Lidt øget smerte under og efter træning betyder ikke nødvendigvis, at knæet belastes forkert, men træningen bør tilpasses den enkelte.",
      },
    ],
  },

  exercises: {
    heading: "Gode øvelser til artrose i knæet",
    intro:
      "Træning er en central del af behandlingen ved artrose i knæet. Øvelserne bør vælges og tilpasses efter symptomer, bevægelighed og dit nuværende aktivitetsniveau.",
    exerciseSlugs: [
      "leg-extension",
      "leg-curls",
      "step-ups",
      "wall-sit",
      "split-squat",
    ],
    ctaLabel: "Se alle styrkeøvelser →",
    ctaHref: "/styrkeoevelser",
  },

  whenToSeekHelp: {
    heading: "Hvornår bør du søge hjælp til artrose i knæet?",
    blocks: [
      {
        type: "paragraph",
        text: "Det kan være relevant at få knæet vurderet, hvis symptomerne begrænser din hverdag, din træning eller din evne til at gå og bevæge dig som normalt.",
      },
      {
        type: "paragraph",
        text: "En individuel vurdering kan blandt andet være relevant, hvis:",
      },
      {
        type: "list",
        items: [
          "Smerterne begrænser dine daglige aktiviteter",
          "Knæet bliver mere stift eller mister bevægelighed",
          "Du har behov for hjælp til at komme i gang med relevant træning",
          "Du er i tvivl om, hvordan knæet bør belastes",
          "Du oplever tilbagevendende hævelse i knæet",
        ],
      },
      {
        type: "paragraph",
        text: "Ved hurtig og kraftig hævelse, et reelt aflåst knæ, feber eller andre alvorlige eller pludseligt opståede symptomer bør du søge lægelig vurdering.",
      },
    ],
  },

  findPhysio: {
    heading: "Find en fysioterapeut til artrose i knæet",
    body: "Har du brug for hjælp til at komme i gang med træning, eller er du i tvivl om, hvordan knæet bør belastes? På Fysfinder kan du finde fysioterapeuter og klinikker med relevante kompetencer og vælge en behandler, der passer til dit behov.",
    ctaLabel: "Find fysioterapeut →",
    specialtySlugs: ["artrose-slidgigt", "knae"],
  },

  relatedConditions: {
    heading: "Andre problemstillinger, der kan give knæsmerter",
    intro:
      "Artrose er ikke den eneste problemstilling, der kan give smerter og stivhed i knæet. Hvis dine symptomer ikke passer på beskrivelsen, kan andre knæproblemer være relevante at læse om.",
    conditionSlugs: [
      "meniskskade",
      "patellofemorale-smerter",
      "springerknae",
    ],
  },

  seoContent: {
    heading: "Artrose i knæet og slidgigt i knæleddet",
    blocks: [
      {
        type: "paragraph",
        text: "Artrose i knæet er en af de mest almindelige årsager til vedvarende knæsmerter, særligt med stigende alder. Betegnelsen slidgigt kan give indtryk af, at knæet er slidt op, men forandringerne i leddet siger ikke nødvendigvis noget om, hvor mange gener man oplever.",
      },
      {
        type: "paragraph",
        text: "Nogle med tydelige forandringer på et røntgenbillede har få symptomer, mens andre med mindre forandringer oplever flere gener. Symptomerne bør derfor altid ses i sammenhæng med funktion og hverdag.",
      },
      { type: "subheading", text: "Kan man træne med artrose i knæet?" },
      {
        type: "paragraph",
        text: "Ja. Træning er en central del af den anbefalede behandling ved artrose i knæet, og fysisk aktivitet slider ikke knæet yderligere. Belastningen bør tilpasses, så knæet gradvist vænner sig til mere aktivitet.",
      },
      { type: "subheading", text: "Bliver artrose i knæet værre med tiden?" },
      {
        type: "paragraph",
        text: "Forløbet varierer meget fra person til person. Mange oplever perioder med flere symptomer efterfulgt af roligere perioder, og symptomerne følger ikke nødvendigvis forandringerne i leddet. Træning, tilpasset belastning og øvrig sundhed kan have betydning for, hvordan hverdagen med artrose opleves.",
      },
    ],
  },

  faq: {
    heading: "Ofte stillede spørgsmål om artrose i knæet",
    items: [
      {
        question: "Hvad er artrose i knæet?",
        answer: [
          "Artrose i knæet – også kaldet slidgigt – er forandringer i knæleddets brusk, knogle og omkringliggende væv. Forandringerne udvikler sig over tid og kan give smerter, stivhed og nedsat funktion.",
        ],
      },
      {
        question: "Er artrose det samme som slidgigt?",
        answer: [
          "Ja. Artrose og slidgigt bruges om samme tilstand. Betegnelsen slidgigt kan dog give indtryk af, at leddet er slidt op, hvilket ikke er en præcis beskrivelse af, hvad der sker i knæet.",
        ],
      },
      {
        question: "Kan man træne med artrose i knæet?",
        answer: [
          "Ja. Træning er en central del af den anbefalede behandling ved artrose i knæet. Fysisk aktivitet slider ikke knæet yderligere, men belastningen bør tilpasses og øges gradvist.",
        ],
      },
      {
        question: "Hvilke øvelser er gode til artrose i knæet?",
        answer: [
          "Styrketræning af musklerne omkring knæet og bevægelighedstræning bruges ofte ved artrose. Der findes dog ikke én bestemt øvelse, der passer til alle, og belastningen bør tilpasses den enkelte.",
          `[Se øvelser til artrose i knæet →](#${CONDITION_SECTION_IDS.exercises})`,
        ],
      },
      {
        question: "Hvorfor er mit knæ stift om morgenen?",
        answer: [
          "Stivhed efter hvile er et almindeligt symptom ved artrose. Den aftager typisk igen, når knæet kommer i bevægelse. Længerevarende og markant morgenstivhed bør vurderes nærmere.",
        ],
      },
      {
        question: "Bliver artrose i knæet altid værre?",
        answer: [
          "Nej. Forløbet varierer meget fra person til person, og mange oplever perioder med flere symptomer efterfulgt af roligere perioder. Symptomerne følger ikke nødvendigvis forandringerne i leddet.",
        ],
      },
      {
        question: "Skal artrose i knæet opereres?",
        answer: [
          "For de fleste er træning og tilpasset belastning det, der forsøges først. Beslutninger om operation træffes af en læge på baggrund af en individuel vurdering af symptomer, funktion og hverdag.",
        ],
      },
      {
        question: "Hvornår bør jeg gå til fysioterapeut med artrose i knæet?",
        answer: [
          "Det kan være relevant at opsøge en fysioterapeut, hvis symptomerne begrænser din hverdag, eller hvis du har brug for hjælp til at komme i gang med relevant træning og finde den rette belastning.",
          "[Find en fysioterapeut →](/find/fysioterapeut/danmark/artrose-slidgigt)",
        ],
      },
    ],
  },
};
