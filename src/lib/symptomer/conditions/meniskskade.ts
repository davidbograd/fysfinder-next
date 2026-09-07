// Added: 2026-09-07 - Meniskskade condition data for the symptom universe. Long-form copy drafted to match the approved Løberknæ register and awaits editorial review.

import { CONDITION_SECTION_IDS } from "../constants";
import type { Condition } from "../types";

export const meniskskade: Condition = {
  slug: "meniskskade",
  name: "Meniskskade",
  bodyAreaSlug: "knae",
  isActive: true,

  metaTitle: "Meniskskade → Symptomer, årsager, behandling og øvelser",
  metaDescription:
    "Bliv klogere på meniskskade, typiske symptomer og mulige årsager. Se hvad du selv kan gøre, relevante øvelser og find en fysioterapeut.",

  h1: "Meniskskade – symptomer, årsager og hvad du kan gøre",
  heroIntro:
    "En meniskskade kan blandt andet give smerter, hævelse og mekaniske gener i knæet. Nogle oplever generne efter et vrid i knæet, mens andre får symptomer gradvist. Bliv klogere på symptomer, mulige årsager, hvad du selv kan gøre, og hvornår det kan være relevant at få professionel hjælp.",
  shortDescription:
    "En problemstilling i knæets menisk, som blandt andet kan give smerter, hævelse eller mekaniske gener.",

  quickFacts: [
    {
      label: "Typisk placering",
      value: "På indersiden eller ydersiden af knæet, i selve ledlinjen",
    },
    {
      label: "Opleves ofte ved",
      value: "Vrid i knæet, dybe bøjninger og belastning med drejning",
    },
    {
      label: "Kan blandt andet opleves som",
      value: "Smerter, hævelse, klik eller fornemmelsen af at knæet låser",
    },
    {
      label: "Relevant hjælp",
      value:
        "Tilpasset belastning, træning og eventuelt lægelig eller fysioterapeutisk vurdering",
    },
  ],

  reviewedBy: { authorSlug: "joachim-bograd", reviewDate: "2026-09-07" },

  introduction: {
    heading: "Hvad er en meniskskade?",
    blocks: [
      {
        type: "paragraph",
        text: "Menisken er to halvmåneformede brusklignende skiver, der ligger mellem lårben og skinneben i knæleddet. De medvirker til at fordele belastningen i knæet. En meniskskade er en problemstilling, hvor menisken er påvirket, og hvor der kan opstå smerter og andre gener i knæet.",
      },
      {
        type: "paragraph",
        text: "Meniskskader inddeles ofte i to overordnede typer: skader, der opstår i forbindelse med et vrid eller en akut belastning, og forandringer, der udvikler sig over tid. Symptomerne kan være forskellige alt efter, hvordan problemstillingen er opstået.",
      },
    ],
  },

  symptoms: {
    heading: "Hvad er symptomerne på en meniskskade?",
    blocks: [
      {
        type: "paragraph",
        text: "Symptomerne kan variere, men smerterne mærkes typisk i knæets ledlinje på inder- eller ydersiden. Nogle oplever også mekaniske gener.",
      },
      {
        type: "list",
        items: [
          "Smerter i ledlinjen på indersiden eller ydersiden af knæet",
          "Hævelse i knæet, ofte i timerne eller dagene efter belastning",
          "Smerter ved dybe bøjninger, squat og drejning",
          "Klik eller knæk fra knæet",
          "Fornemmelsen af, at knæet giver efter eller låser",
        ],
      },
      {
        type: "paragraph",
        text: "De samme symptomer kan forekomme ved andre problemstillinger i knæet. Symptomerne kan derfor ikke alene afgøre, om der er tale om en meniskskade.",
      },
    ],
  },

  causes: {
    heading: "Hvad skyldes en meniskskade?",
    blocks: [
      {
        type: "paragraph",
        text: "En meniskskade kan opstå på flere måder. Hos yngre og aktive sker det ofte i forbindelse med et vrid i knæet under belastning, eksempelvis i sport med hurtige retningsskift. Hos andre udvikler forandringerne sig gradvist over tid, uden at der har været en tydelig skade.",
      },
      {
        type: "paragraph",
        text: "Der er ikke nødvendigvis én enkelt årsag. Flere faktorer kan spille sammen, og derfor bør årsagen vurderes ud fra den enkelte persons symptomer, alder, aktivitetsniveau og belastning.",
      },
      { type: "subheading", text: "Typiske faktorer ved meniskskade" },
      {
        type: "paragraph",
        text: "Flere forhold kan være medvirkende til, at symptomerne opstår eller forværres. Det gælder blandt andet:",
      },
      {
        type: "list",
        items: [
          "Vrid i knæet med foden plantet i gulvet",
          "Dybe bøjninger under belastning",
          "Sport med hurtige retningsskift og stop",
          "Gradvise forandringer i knæleddet med alderen",
          "Nedsat styrke omkring knæet i forhold til belastningen",
        ],
      },
    ],
  },

  selfManagement: {
    heading: "Hvad kan du gøre ved en meniskskade?",
    blocks: [
      {
        type: "paragraph",
        text: "Hvad der er relevant afhænger blandt andet af, hvordan problemstillingen er opstået, og hvor udtalte symptomerne er. Ved mange meniskproblemer kan tilpasset belastning og træning være relevant, og for en del vil et træningsforløb være det første, der forsøges.",
      },
      {
        type: "paragraph",
        text: "Afhængigt af symptomerne kan det blandt andet være relevant at arbejde med:",
      },
      {
        type: "list",
        items: [
          "Midlertidig tilpasning af de bevægelser, der provokerer smerterne",
          "Styrketræning af lår, baller og lægge",
          "Gradvis genoptræning af bevægelighed i knæet",
          "Gradvis progression i belastning og aktivitet",
          "Tilpasset tilbagevenden til sport med drejninger og retningsskift",
        ],
      },
      {
        type: "paragraph",
        text: "Ved kraftig hævelse, et knæ der reelt låser, eller hvis knæet ikke kan strækkes ud, bør du søge sundhedsfaglig vurdering frem for at træne videre på egen hånd.",
      },
    ],
  },

  exercises: {
    heading: "Gode øvelser ved meniskskade",
    intro:
      "Træning kan være en relevant del af et forløb ved en meniskskade. Øvelserne bør vælges og tilpasses efter symptomer, bevægelighed og den belastning, du ønsker at vende tilbage til.",
    exerciseSlugs: [
      "leg-extension",
      "leg-curls",
      "step-ups",
      "wall-sit",
      "glute-bridge",
    ],
    ctaLabel: "Se alle styrkeøvelser →",
    ctaHref: "/styrkeoevelser",
  },

  whenToSeekHelp: {
    heading: "Hvornår bør du søge hjælp ved en meniskskade?",
    blocks: [
      {
        type: "paragraph",
        text: "Det kan være relevant at få knæet undersøgt, hvis symptomerne fortsætter, bliver værre eller gør det svært at gå, træne eller klare almindelige aktiviteter.",
      },
      {
        type: "paragraph",
        text: "En individuel vurdering kan blandt andet være relevant, hvis:",
      },
      {
        type: "list",
        items: [
          "Knæet hæver op efter belastning",
          "Du oplever, at knæet giver efter",
          "Symptomerne bliver ved med at komme tilbage",
          "Generne begrænser din træning eller hverdag",
          "Du er i tvivl om, hvad der ligger bag dine knæsmerter",
        ],
      },
      {
        type: "paragraph",
        text: "Du bør søge lægelig vurdering ved et reelt aflåst knæ, hvis knæet ikke kan strækkes ud, ved hurtig og kraftig hævelse efter en skade eller ved andre alvorlige eller pludseligt opståede symptomer.",
      },
    ],
  },

  findPhysio: {
    heading: "Find en fysioterapeut til meniskproblemer",
    body: "Har du gener i knæet efter et vrid, eller er du i tvivl om, hvad der ligger bag dine symptomer? På Fysfinder kan du finde fysioterapeuter og klinikker med relevante kompetencer og vælge en behandler, der passer til dit behov.",
    ctaLabel: "Find fysioterapeut →",
    specialtySlugs: ["knae"],
  },

  relatedConditions: {
    heading: "Andre problemstillinger, der kan give knæsmerter",
    intro:
      "Meniskskade er ikke den eneste problemstilling, der kan give smerter, hævelse eller mekaniske gener i knæet. Hvis dine symptomer ikke passer på beskrivelsen, kan andre knæproblemer være relevante at læse om.",
    conditionSlugs: ["artrose", "patellofemorale-smerter", "loeberknae"],
  },

  seoContent: {
    heading: "Meniskskade og smerter i knæets ledlinje",
    blocks: [
      {
        type: "paragraph",
        text: "Meniskproblemer er blandt de mest almindelige årsager til knæsmerter og ses i alle aldersgrupper. Hos yngre opstår de ofte i forbindelse med sport, mens de hos ældre oftere er en del af gradvise forandringer i knæleddet.",
      },
      {
        type: "paragraph",
        text: "Symptomerne kan variere meget, og ikke alle meniskforandringer giver gener. Fund på en scanning skal derfor altid ses i sammenhæng med de symptomer, man faktisk oplever.",
      },
      { type: "subheading", text: "Kan en meniskskade hele af sig selv?" },
      {
        type: "paragraph",
        text: "Symptomerne fra en meniskskade kan for nogle aftage over tid, særligt når belastningen tilpasses og knæet gradvist trænes op. For andre er generne mere vedvarende. Hvad der er relevant afhænger blandt andet af symptomerne, alder og aktivitetsniveau, og bør vurderes individuelt.",
      },
      { type: "subheading", text: "Skal en meniskskade opereres?" },
      {
        type: "paragraph",
        text: "Ikke nødvendigvis. Ved mange meniskproblemer forsøges et træningsforløb først, og for en stor del af patienterne er det tilstrækkeligt. Beslutninger om operation træffes af en læge på baggrund af en individuel vurdering.",
      },
    ],
  },

  faq: {
    heading: "Ofte stillede spørgsmål om meniskskade",
    items: [
      {
        question: "Hvad er en meniskskade?",
        answer: [
          "En meniskskade er en problemstilling i én af knæets to menisker – de brusklignende skiver, der medvirker til at fordele belastningen i knæleddet. Den kan opstå akut ved et vrid eller udvikle sig gradvist over tid.",
        ],
      },
      {
        question: "Hvor sidder smerten ved en meniskskade?",
        answer: [
          "Smerterne mærkes typisk i knæets ledlinje på indersiden eller ydersiden af knæet. Nogle oplever også en mere diffus smerte i og omkring knæet.",
        ],
      },
      {
        question: "Hvordan føles en meniskskade?",
        answer: [
          "Mange oplever smerter ved dybe bøjninger, drejning og belastning, og nogle får hævelse i knæet efter aktivitet. Klik, knæk eller fornemmelsen af, at knæet giver efter eller låser, kan også forekomme.",
        ],
      },
      {
        question: "Kan man træne med en meniskskade?",
        answer: [
          "Ved mange meniskproblemer kan tilpasset træning være relevant, og for en del er et træningsforløb det første, der forsøges. Hvordan knæet bør belastes afhænger dog af symptomerne og bør vurderes individuelt – særligt efter en akut skade.",
        ],
      },
      {
        question: "Hvilke øvelser er gode ved en meniskskade?",
        answer: [
          "Der findes ikke én bestemt øvelse, der passer til alle. Styrketræning af musklerne omkring knæet og gradvis genoptræning af bevægelighed bruges ofte, men valg og belastning bør tilpasses den enkelte.",
          `[Se øvelser ved meniskskade →](#${CONDITION_SECTION_IDS.exercises})`,
        ],
      },
      {
        question: "Hvad betyder det, hvis knæet låser?",
        answer: [
          "Hvis knæet reelt låser, så bevægeligheden bliver begrænset og knæet ikke kan strækkes ud, kan det blandt andet forekomme ved en meniskskade. Et aflåst knæ bør vurderes af en læge.",
        ],
      },
      {
        question: "Skal en meniskskade opereres?",
        answer: [
          "Ikke nødvendigvis. Ved mange meniskproblemer forsøges et træningsforløb først. Beslutninger om operation træffes af en læge på baggrund af en individuel vurdering af symptomer, funktion og undersøgelsesfund.",
        ],
      },
      {
        question: "Hvornår bør jeg gå til fysioterapeut med meniskproblemer?",
        answer: [
          "Det kan være relevant at opsøge en fysioterapeut, hvis symptomerne fortsætter, kommer tilbage, begrænser din aktivitet eller hvis du har behov for hjælp til at genoptræne knæet.",
          "[Find en fysioterapeut →](/find/fysioterapeut/danmark/knae)",
        ],
      },
    ],
  },
};
