// Added: 2026-09-07 - Springerknæ condition data for the symptom universe. Long-form copy drafted to match the approved Løberknæ register and awaits editorial review.

import { CONDITION_SECTION_IDS } from "../constants";
import type { Condition } from "../types";

export const springerknae: Condition = {
  slug: "springerknae",
  name: "Springerknæ",
  bodyAreaSlug: "knae",
  isActive: true,

  metaTitle: "Springerknæ → Symptomer, årsager, behandling og øvelser",
  metaDescription:
    "Bliv klogere på springerknæ, typiske symptomer og mulige årsager. Se hvad du selv kan gøre, relevante øvelser og find en fysioterapeut.",

  h1: "Springerknæ – symptomer, årsager og hvad du kan gøre",
  heroIntro:
    "Springerknæ giver typisk smerter omkring knæskalssenen lige under knæskallen og ses ofte ved aktiviteter med hop, løb og høj belastning. Bliv klogere på symptomer, mulige årsager, hvad du selv kan gøre, og hvornår det kan være relevant at få professionel hjælp.",
  shortDescription:
    "Smerter omkring knæskalssenen, som ofte forbindes med aktiviteter med hop, løb og høj belastning.",

  quickFacts: [
    {
      label: "Typisk placering",
      value: "Lige under knæskallen, omkring knæskalssenen",
    },
    { label: "Opleves ofte ved", value: "Hop, løb, spring og høj belastning" },
    {
      label: "Kan blandt andet opleves som",
      value: "Smerter og ømhed under knæskallen, som kommer under aktivitet",
    },
    {
      label: "Relevant hjælp",
      value:
        "Tilpasset belastning, styrketræning og eventuelt fysioterapeutisk vurdering",
    },
  ],

  reviewedBy: { authorSlug: "joachim-bograd", reviewDate: "2026-09-07" },

  introduction: {
    heading: "Hvad er springerknæ?",
    blocks: [
      {
        type: "paragraph",
        text: "Springerknæ er en problemstilling, der typisk giver smerter omkring knæskalssenen – senen der forbinder knæskallen med skinnebenet. Tilstanden kaldes også patellar tendinopati og forbindes ofte med sportsgrene, hvor knæet belastes med hop, spring og hurtige retningsskift.",
      },
      {
        type: "paragraph",
        text: "Generne udvikler sig typisk gradvist og mærkes ofte tydeligst i begyndelsen af en træning eller efter aktivitet, hvor senen har været belastet.",
      },
    ],
  },

  symptoms: {
    heading: "Hvad er symptomerne på springerknæ?",
    blocks: [
      {
        type: "paragraph",
        text: "Symptomerne ved springerknæ kan variere, men smerterne opleves typisk lige under knæskallen og i forbindelse med belastning af knæet.",
      },
      {
        type: "list",
        items: [
          "Smerter lige under knæskallen",
          "Ømhed, når du trykker på knæskalssenen",
          "Smerter, der opstår ved hop, landinger eller løb",
          "Gener ved squat, trapper og længere tids siddende stilling",
          "Stivhed eller smerter, når du starter en aktivitet op",
        ],
      },
      {
        type: "paragraph",
        text: "De samme symptomer kan forekomme ved andre problemstillinger foran på knæet. Symptomerne kan derfor ikke alene afgøre, om du har springerknæ.",
      },
    ],
  },

  causes: {
    heading: "Hvad skyldes springerknæ?",
    blocks: [
      {
        type: "paragraph",
        text: "Springerknæ forbindes ofte med belastning af knæskalssenen over tid. Symptomerne kan blandt andet opstå, når belastningen af senen bliver større, end den aktuelt kan tåle.",
      },
      {
        type: "paragraph",
        text: "Der er ikke nødvendigvis én enkelt årsag. Flere faktorer kan spille sammen, og derfor bør årsagen vurderes ud fra den enkelte persons symptomer, aktivitetsniveau og belastning.",
      },
      { type: "subheading", text: "Typiske faktorer ved springerknæ" },
      {
        type: "paragraph",
        text: "Flere forhold i forbindelse med træning og restitution kan være medvirkende til, at symptomerne opstår eller forværres. Det gælder blandt andet:",
      },
      {
        type: "list",
        items: [
          "Mange hop og landinger inden for kort tid",
          "Hurtig stigning i træningsmængde eller intensitet",
          "Skift til nye eller mere belastende aktiviteter",
          "Utilstrækkelig restitution mellem træningerne",
          "Nedsat styrke i lår, baller og lægge i forhold til belastningen",
        ],
      },
    ],
  },

  selfManagement: {
    heading: "Hvad kan du gøre ved springerknæ?",
    blocks: [
      {
        type: "paragraph",
        text: "Ved springerknæ vil det ofte være relevant at se på den belastning, der fremkalder symptomerne. Det betyder ikke nødvendigvis, at al aktivitet skal stoppes, men mængden af hop, spring og hurtige belastninger kan have behov for at blive tilpasset i en periode.",
      },
      {
        type: "paragraph",
        text: "Afhængigt af symptomerne kan det blandt andet være relevant at arbejde med:",
      },
      {
        type: "list",
        items: [
          "Midlertidig tilpasning af hop- og springbelastning",
          "Rolig, tung styrketræning af knæ og lår",
          "Gradvis progression i belastningen over tid",
          "Tilstrækkelig restitution mellem træningerne",
          "Gradvis tilbagevenden til sport og fuld belastning",
        ],
      },
      {
        type: "paragraph",
        text: "Hvad der passer til den enkelte afhænger blandt andet af symptomernes omfang, varighed og aktivitetsniveau.",
      },
    ],
  },

  exercises: {
    heading: "Gode øvelser til springerknæ",
    intro:
      "Træning kan være en relevant del af et forløb ved springerknæ. Øvelserne bør vælges og tilpasses efter symptomer, styrke og den belastning, du ønsker at vende tilbage til.",
    exerciseSlugs: [
      "spanish-squat",
      "leg-extension",
      "split-squat",
      "wall-sit",
      "step-ups",
    ],
    ctaLabel: "Se alle styrkeøvelser →",
    ctaHref: "/styrkeoevelser",
  },

  whenToSeekHelp: {
    heading: "Hvornår bør du søge hjælp til springerknæ?",
    blocks: [
      {
        type: "paragraph",
        text: "Det kan være relevant at få knæet undersøgt, hvis smerterne fortsætter, bliver værre eller gør det svært at træne, spille eller klare almindelige aktiviteter.",
      },
      {
        type: "paragraph",
        text: "En individuel vurdering kan blandt andet være relevant, hvis:",
      },
      {
        type: "list",
        items: [
          "Symptomerne bliver ved med at komme tilbage",
          "Smerterne bliver værre under eller efter aktivitet",
          "Du ikke kan øge belastningen uden smerter",
          "Generne begrænser din sport eller hverdag",
          "Du har behov for hjælp til at tilpasse træning og belastning",
        ],
      },
      {
        type: "paragraph",
        text: "Ved en akut skade, kraftig hævelse, et aflåst knæ eller andre alvorlige eller pludseligt opståede symptomer bør du søge relevant sundhedsfaglig vurdering.",
      },
    ],
  },

  findPhysio: {
    heading: "Find en fysioterapeut til springerknæ",
    body: "Har dine knæsmerter betydning for din sport, træning eller hverdag? På Fysfinder kan du finde fysioterapeuter og klinikker med relevante kompetencer og vælge en behandler, der passer til dit behov.",
    ctaLabel: "Find fysioterapeut →",
    specialtySlugs: ["springerknae", "knae"],
  },

  relatedConditions: {
    heading: "Andre problemstillinger, der kan give knæsmerter",
    intro:
      "Springerknæ er ikke den eneste problemstilling, der kan give smerter foran på knæet. Hvis dine symptomer ikke passer på beskrivelsen af springerknæ, kan andre knæproblemer være relevante at læse om.",
    conditionSlugs: ["patellofemorale-smerter", "loeberknae", "artrose"],
  },

  seoContent: {
    heading: "Springerknæ og smerter under knæskallen",
    blocks: [
      {
        type: "paragraph",
        text: "Springerknæ er en almindelig problemstilling i sportsgrene med mange hop og landinger, eksempelvis håndbold, basketball og volleyball. Smerterne mærkes karakteristisk lige under knæskallen, hvor knæskalssenen sidder.",
      },
      {
        type: "paragraph",
        text: "Hvor hurtigt symptomerne opstår, og hvor meget aktivitet der skal til for at fremkalde dem, kan variere fra person til person.",
      },
      { type: "subheading", text: "Kan man træne med springerknæ?" },
      {
        type: "paragraph",
        text: "Hvor meget du kan og bør træne afhænger af dine symptomer og hvordan knæet reagerer på belastningen. I nogle tilfælde kan træningen fortsættes i tilpasset form, mens det i andre tilfælde kan være nødvendigt midlertidigt at reducere mængden af hop og spring.",
      },
      {
        type: "paragraph",
        text: "Målet vil typisk være at finde et belastningsniveau, som senen kan tolerere, og derefter gradvist øge belastningen igen.",
      },
      { type: "subheading", text: "Hvor lang tid tager springerknæ?" },
      {
        type: "paragraph",
        text: "Hvor længe symptomer ved springerknæ varer varierer og afhænger blandt andet af symptomernes omfang, hvor længe problemet har stået på og hvordan belastningen tilpasses. Senevæv tilpasser sig ofte langsomt, og et forløb kan derfor strække sig over flere måneder.",
      },
      {
        type: "paragraph",
        text: "Der findes derfor ikke én bestemt tidsramme, der gælder for alle.",
      },
    ],
  },

  faq: {
    heading: "Ofte stillede spørgsmål om springerknæ",
    items: [
      {
        question: "Hvad er springerknæ?",
        answer: [
          "Springerknæ er en problemstilling, der typisk giver smerter omkring knæskalssenen lige under knæskallen. Tilstanden kaldes også patellar tendinopati og ses ofte i sportsgrene med hop, spring og hurtige retningsskift.",
        ],
      },
      {
        question: "Hvor sidder smerten ved springerknæ?",
        answer: [
          "Smerterne ved springerknæ sidder typisk lige under knæskallen, hvor knæskalssenen begynder. Området kan også være ømt, når du trykker på det.",
        ],
      },
      {
        question: "Hvordan føles springerknæ?",
        answer: [
          "Springerknæ opleves typisk som en lokal smerte under knæskallen, der kommer i forbindelse med belastning. For nogle mærkes generne tydeligst i starten af en træning eller dagen efter aktivitet.",
        ],
      },
      {
        question: "Hvorfor får man springerknæ?",
        answer: [
          "Springerknæ forbindes med belastning af knæskalssenen over tid og kan blandt andet opstå ved mange hop og landinger eller ved hurtige ændringer i træningsmængde. Der kan være flere medvirkende faktorer, og årsagen varierer fra person til person.",
        ],
      },
      {
        question: "Skal man holde pause fra sport ved springerknæ?",
        answer: [
          "Det er ikke nødvendigvis nødvendigt at stoppe al aktivitet. Det kan i stedet være relevant at reducere de belastninger, der fremkalder symptomerne – ofte hop og spring – og derefter gradvist øge dem igen.",
        ],
      },
      {
        question: "Hvilke øvelser er gode til springerknæ?",
        answer: [
          "Der findes ikke én bestemt øvelse, der passer til alle med springerknæ. Rolig og tung styrketræning af knæ og lår bruges ofte, men valg og belastning bør tilpasses den enkelte.",
          `[Se øvelser til springerknæ →](#${CONDITION_SECTION_IDS.exercises})`,
        ],
      },
      {
        question: "Hvor lang tid varer springerknæ?",
        answer: [
          "Varigheden varierer afhængigt af blandt andet symptomernes omfang, hvor længe de har været til stede og hvordan træning og belastning håndteres. Der findes derfor ikke én bestemt tidsramme for alle.",
        ],
      },
      {
        question: "Hvornår bør jeg gå til fysioterapeut med springerknæ?",
        answer: [
          "Det kan være relevant at opsøge en fysioterapeut, hvis smerterne fortsætter, kommer tilbage, begrænser din aktivitet eller hvis du er usikker på årsagen til dine knæsmerter.",
          "[Find en fysioterapeut →](/find/fysioterapeut/danmark/springerknae)",
        ],
      },
      {
        question:
          "Hvordan ved jeg, om jeg har springerknæ eller noget andet i knæet?",
        answer: [
          "Placeringen af smerten og hvornår den opstår kan give en indikation af relevante problemstillinger, men symptomer alene kan ikke stille en sikker diagnose. Andre problemstillinger foran på knæet kan give lignende symptomer, og ved tvivl kan en individuel undersøgelse være relevant.",
        ],
      },
    ],
  },
};
