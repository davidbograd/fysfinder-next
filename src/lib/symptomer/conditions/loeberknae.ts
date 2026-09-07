// Added: 2026-09-07 - Løberknæ condition data. Reference implementation for the generic ConditionPage template.

import { CONDITION_SECTION_IDS } from "../constants";
import type { Condition } from "../types";

export const loeberknae: Condition = {
  slug: "loeberknae",
  name: "Løberknæ",
  bodyAreaSlug: "knae",
  isActive: true,

  metaTitle: "Løberknæ → Symptomer, årsager, behandling og øvelser",
  metaDescription:
    "Bliv klogere på løberknæ, typiske symptomer og mulige årsager. Se hvad du selv kan gøre, relevante øvelser og find en fysioterapeut.",

  h1: "Løberknæ – symptomer, årsager og hvad du kan gøre",
  heroIntro:
    "Løberknæ giver typisk smerter på ydersiden af knæet og ses ofte i forbindelse med løb eller anden gentagen belastning. Bliv klogere på symptomer, mulige årsager, hvad du selv kan gøre, og hvornår det kan være relevant at få professionel hjælp.",
  shortDescription:
    "Smerter på ydersiden af knæet, som ofte opleves i forbindelse med løb og gentagen belastning.",

  quickFacts: [
    { label: "Typisk placering", value: "Ydersiden af knæet" },
    { label: "Opleves ofte ved", value: "Løb og gentagen belastning" },
    {
      label: "Kan blandt andet opleves som",
      value: "Smerter eller ømhed på ydersiden af knæet",
    },
    {
      label: "Relevant hjælp",
      value:
        "Tilpasset belastning, træning og eventuelt fysioterapeutisk vurdering",
    },
  ],

  reviewedBy: { authorSlug: "joachim-bograd", reviewDate: "2026-09-07" },

  introduction: {
    heading: "Hvad er løberknæ?",
    blocks: [
      {
        type: "paragraph",
        text: "Løberknæ er en problemstilling, der typisk giver smerter på ydersiden af knæet i forbindelse med gentagen belastning. Tilstanden forbindes ofte med løb og kaldes også iliotibial band syndrome (ITBS).",
      },
      {
        type: "paragraph",
        text: "Generne opstår typisk under aktivitet og kan gøre det svært at fortsætte med den belastning, der fremkalder smerterne.",
      },
    ],
  },

  symptoms: {
    heading: "Hvad er symptomerne på løberknæ?",
    blocks: [
      {
        type: "paragraph",
        text: "Symptomerne ved løberknæ kan variere, men smerterne opleves typisk på ydersiden af knæet og i forbindelse med aktivitet.",
      },
      {
        type: "list",
        items: [
          "Smerter på ydersiden af knæet",
          "Smerter, der opstår eller forværres under løb",
          "Ømhed omkring ydersiden af knæet",
          "Gener ved gentagen bøjning og strækning af knæet",
          "Symptomer, der kan aftage, når belastningen stoppes",
        ],
      },
      {
        type: "paragraph",
        text: "De samme symptomer kan forekomme ved andre knæproblemer. Symptomerne kan derfor ikke alene afgøre, om du har løberknæ.",
      },
    ],
  },

  causes: {
    heading: "Hvad skyldes løberknæ?",
    blocks: [
      {
        type: "paragraph",
        text: "Løberknæ forbindes ofte med gentagen belastning af området på ydersiden af knæet. Problemet kan blandt andet opstå i forbindelse med ændringer i træningsmængde, intensitet eller andre forhold, der ændrer den belastning, kroppen udsættes for.",
      },
      {
        type: "paragraph",
        text: "Der er ikke nødvendigvis én enkelt årsag. Flere faktorer kan spille sammen, og derfor bør årsagen vurderes ud fra den enkelte persons symptomer, aktivitetsniveau og belastning.",
      },
      { type: "subheading", text: "Typiske faktorer ved løberknæ" },
      {
        type: "paragraph",
        text: "Flere forhold i forbindelse med træning og restitution kan være medvirkende til, at symptomerne opstår eller forværres. Det gælder blandt andet:",
      },
      {
        type: "list",
        items: [
          "Hurtig stigning i løbemængde",
          "Øget træningsintensitet",
          "Mange gentagne belastninger af knæet",
          "Ændringer i løbetræningen",
          "Utilstrækkelig restitution i forhold til belastningen",
        ],
      },
    ],
  },

  selfManagement: {
    heading: "Hvad kan du gøre ved løberknæ?",
    blocks: [
      {
        type: "paragraph",
        text: "Ved løberknæ vil det ofte være relevant at se på den aktivitet og belastning, der fremkalder symptomerne. Det betyder ikke nødvendigvis, at al aktivitet skal stoppes, men belastningen kan have behov for at blive tilpasset.",
      },
      {
        type: "paragraph",
        text: "Afhængigt af symptomerne kan det blandt andet være relevant at arbejde med:",
      },
      {
        type: "list",
        items: [
          "Tilpasning af løbemængde og intensitet",
          "Gradvis tilbagevenden til belastende aktivitet",
          "Relevant styrketræning",
          "Tilstrækkelig restitution",
          "Gradvis progression i træningen",
        ],
      },
      {
        type: "paragraph",
        text: "Hvad der passer til den enkelte afhænger blandt andet af symptomernes omfang, varighed og aktivitetsniveau.",
      },
    ],
  },

  exercises: {
    heading: "Gode øvelser til løberknæ",
    intro:
      "Træning kan være en relevant del af et forløb ved løberknæ. Øvelserne bør vælges og tilpasses efter symptomer, styrke og den belastning, du ønsker at vende tilbage til.",
    exerciseSlugs: [
      "split-squat",
      "step-ups",
      "side-lying-hip-abduction",
      "monster-walks",
      "glute-bridge",
    ],
    ctaLabel: "Se alle styrkeøvelser →",
    ctaHref: "/styrkeoevelser",
  },

  whenToSeekHelp: {
    heading: "Hvornår bør du søge hjælp til løberknæ?",
    blocks: [
      {
        type: "paragraph",
        text: "Det kan være relevant at få knæet undersøgt, hvis smerterne fortsætter, bliver værre eller gør det svært at løbe, træne eller klare almindelige aktiviteter.",
      },
      {
        type: "paragraph",
        text: "En individuel vurdering kan blandt andet være relevant, hvis:",
      },
      {
        type: "list",
        items: [
          "Symptomerne bliver ved med at komme tilbage",
          "Du ikke kan øge belastningen uden smerter",
          "Generne begrænser din træning eller hverdag",
          "Du er i tvivl om, hvorvidt symptomerne skyldes løberknæ",
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
    heading: "Find en fysioterapeut til løberknæ",
    body: "Har dine knæsmerter betydning for din løb, træning eller hverdag? På Fysfinder kan du finde fysioterapeuter og klinikker med relevante kompetencer og vælge en behandler, der passer til dit behov.",
    ctaLabel: "Find fysioterapeut →",
    specialtySlugs: ["loeberknae", "knae"],
  },

  relatedConditions: {
    heading: "Andre problemstillinger, der kan give knæsmerter",
    intro:
      "Løberknæ er ikke den eneste problemstilling, der kan give smerter i forbindelse med aktivitet. Hvis dine symptomer ikke passer på beskrivelsen af løberknæ, kan andre knæproblemer være relevante at læse om.",
    conditionSlugs: [
      "patellofemorale-smerter",
      "springerknae",
      "meniskskade",
    ],
  },

  seoContent: {
    heading: "Løberknæ og smerter på ydersiden af knæet",
    blocks: [
      {
        type: "paragraph",
        text: "Løberknæ er en almindelig problemstilling blandt personer, der løber, og er karakteriseret ved smerter på ydersiden af knæet. Generne opstår ofte under løb og kan udvikle sig gradvist i takt med gentagen belastning.",
      },
      {
        type: "paragraph",
        text: "Hvor hurtigt symptomerne opstår, og hvor meget aktivitet der skal til for at fremkalde dem, kan variere. For nogle mærkes smerterne først efter en bestemt distance, mens andre oplever gener tidligere i træningen.",
      },
      { type: "subheading", text: "Kan man løbe med løberknæ?" },
      {
        type: "paragraph",
        text: "Hvor meget du kan og bør løbe afhænger af dine symptomer og hvordan knæet reagerer på belastningen. I nogle tilfælde kan løbetræningen fortsættes i tilpasset form, mens det i andre tilfælde kan være nødvendigt midlertidigt at reducere mængde eller intensitet.",
      },
      {
        type: "paragraph",
        text: "Målet vil typisk være at finde et belastningsniveau, som knæet kan tolerere, og derefter gradvist øge belastningen igen.",
      },
      { type: "subheading", text: "Hvor lang tid tager løberknæ?" },
      {
        type: "paragraph",
        text: "Hvor længe symptomer ved løberknæ varer varierer fra person til person og afhænger blandt andet af symptomernes omfang, hvor længe problemet har stået på og hvordan belastningen tilpasses.",
      },
      {
        type: "paragraph",
        text: "Der findes derfor ikke én bestemt tidsramme, der gælder for alle.",
      },
    ],
  },

  faq: {
    heading: "Ofte stillede spørgsmål om løberknæ",
    items: [
      {
        question: "Hvad er løberknæ?",
        answer: [
          "Løberknæ er en problemstilling, der typisk giver smerter på ydersiden af knæet i forbindelse med gentagen belastning. Tilstanden ses ofte hos løbere, men kan også forekomme i forbindelse med andre aktiviteter.",
        ],
      },
      {
        question: "Hvor sidder smerten ved løberknæ?",
        answer: [
          "Smerterne ved løberknæ sidder typisk på ydersiden af knæet. De kan især opleves under aktiviteter med gentagne bevægelser i knæet, eksempelvis løb.",
        ],
      },
      {
        question: "Hvordan føles løberknæ?",
        answer: [
          "Løberknæ opleves typisk som smerte eller ømhed på ydersiden af knæet. Generne kan udvikle sig under aktivitet og blive mere tydelige, jo længere knæet belastes.",
        ],
      },
      {
        question: "Hvorfor får man løberknæ?",
        answer: [
          "Løberknæ forbindes med gentagen belastning og kan blandt andet opstå i forbindelse med ændringer i træningsmængde eller intensitet. Der kan være flere medvirkende faktorer, og årsagen varierer fra person til person.",
        ],
      },
      {
        question: "Kan man løbe med løberknæ?",
        answer: [
          "Det afhænger af symptomerne. For nogle kan løbetræningen fortsættes med reduceret mængde eller intensitet, mens andre har behov for en større midlertidig ændring af belastningen. Træningen bør tilpasses efter, hvordan knæet reagerer.",
        ],
      },
      {
        question: "Skal man holde pause fra løb ved løberknæ?",
        answer: [
          "Det er ikke nødvendigvis nødvendigt at stoppe al aktivitet. Det kan i stedet være relevant at reducere eller ændre den belastning, der fremkalder symptomerne, og derefter gradvist øge den igen.",
        ],
      },
      {
        question: "Hvilke øvelser er gode til løberknæ?",
        answer: [
          "Der findes ikke én bestemt øvelse, der passer til alle med løberknæ. Styrketræning af blandt andet ben og hofte kan være relevant, men valg og belastning bør tilpasses den enkelte.",
          `[Se øvelser til løberknæ →](#${CONDITION_SECTION_IDS.exercises})`,
        ],
      },
      {
        question: "Hvor lang tid varer løberknæ?",
        answer: [
          "Varigheden varierer afhængigt af blandt andet symptomernes omfang, hvor længe de har været til stede og hvordan træning og belastning håndteres. Derfor findes der ikke én bestemt tidsramme for alle.",
        ],
      },
      {
        question: "Hvornår bør jeg gå til fysioterapeut med løberknæ?",
        answer: [
          "Det kan være relevant at opsøge en fysioterapeut, hvis smerterne fortsætter, kommer tilbage, begrænser din aktivitet eller hvis du er usikker på årsagen til dine knæsmerter.",
          "[Find en fysioterapeut →](/find/fysioterapeut/danmark/loeberknae)",
        ],
      },
      {
        question:
          "Hvordan ved jeg, om jeg har løberknæ eller en anden knæskade?",
        answer: [
          "Placeringen af smerten og hvornår den opstår kan give en indikation af relevante problemstillinger, men symptomer alene kan ikke stille en sikker diagnose. Andre knæproblemer kan give lignende symptomer, og ved tvivl kan en individuel undersøgelse være relevant.",
        ],
      },
    ],
  },
};
