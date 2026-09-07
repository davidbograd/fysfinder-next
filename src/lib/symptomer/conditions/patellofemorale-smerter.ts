// Added: 2026-09-07 - Patellofemorale smerter condition data for the symptom universe. Long-form copy drafted to match the approved Løberknæ register and awaits editorial review.

import { CONDITION_SECTION_IDS } from "../constants";
import type { Condition } from "../types";

export const patellofemoraleSmerter: Condition = {
  slug: "patellofemorale-smerter",
  name: "Patellofemorale smerter",
  bodyAreaSlug: "knae",
  isActive: true,

  metaTitle:
    "Patellofemorale smerter → Symptomer, årsager, behandling og øvelser",
  metaDescription:
    "Bliv klogere på patellofemorale smerter, typiske symptomer og mulige årsager. Se hvad du selv kan gøre, relevante øvelser og find en fysioterapeut.",

  h1: "Patellofemorale smerter – symptomer, årsager og hvad du kan gøre",
  heroIntro:
    "Patellofemorale smerter giver typisk gener omkring eller bag knæskallen og mærkes blandt andet ved trapper, squat eller længere tids siddende stilling. Bliv klogere på symptomer, mulige årsager, hvad du selv kan gøre, og hvornår det kan være relevant at få professionel hjælp.",
  shortDescription:
    "Smerter omkring eller bag knæskallen, som blandt andet kan mærkes ved trapper, squat eller længere tids siddende stilling.",

  quickFacts: [
    { label: "Typisk placering", value: "Omkring eller bag knæskallen" },
    {
      label: "Opleves ofte ved",
      value: "Trapper, squat, løb og længere tids siddende stilling",
    },
    {
      label: "Kan blandt andet opleves som",
      value: "Diffuse smerter foran på knæet, som er svære at placere præcist",
    },
    {
      label: "Relevant hjælp",
      value:
        "Tilpasset belastning, styrketræning og eventuelt fysioterapeutisk vurdering",
    },
  ],

  reviewedBy: { authorSlug: "joachim-bograd", reviewDate: "2026-09-07" },

  introduction: {
    heading: "Hvad er patellofemorale smerter?",
    blocks: [
      {
        type: "paragraph",
        text: "Patellofemorale smerter er en samlet betegnelse for smerter omkring eller bag knæskallen. Navnet henviser til området mellem knæskallen (patella) og lårbenet (femur), og tilstanden omtales også som patellofemoralt smertesyndrom eller løberknæ i den forreste del af knæet.",
      },
      {
        type: "paragraph",
        text: "Generne er ofte diffuse og kan være svære at placere præcist. De opstår typisk gradvist og mærkes særligt i situationer, hvor knæet bøjes under belastning.",
      },
    ],
  },

  symptoms: {
    heading: "Hvad er symptomerne på patellofemorale smerter?",
    blocks: [
      {
        type: "paragraph",
        text: "Symptomerne kan variere, men smerterne opleves typisk foran på knæet og i forbindelse med aktiviteter, hvor knæet bøjes og belastes.",
      },
      {
        type: "list",
        items: [
          "Diffuse smerter omkring eller bag knæskallen",
          "Gener ved gang på trapper – især ned ad",
          "Smerter ved squat, knæbøj og udfald",
          "Gener efter længere tids siddende stilling med bøjet knæ",
          "Smerter under eller efter løb og anden gentagen belastning",
        ],
      },
      {
        type: "paragraph",
        text: "De samme symptomer kan forekomme ved andre problemstillinger i knæet. Symptomerne kan derfor ikke alene afgøre, om der er tale om patellofemorale smerter.",
      },
    ],
  },

  causes: {
    heading: "Hvad skyldes patellofemorale smerter?",
    blocks: [
      {
        type: "paragraph",
        text: "Patellofemorale smerter forbindes ofte med belastningen af området omkring knæskallen. Symptomerne kan blandt andet opstå, når belastningen overstiger det, som vævet aktuelt kan tåle, eller når belastningen ændrer sig over kort tid.",
      },
      {
        type: "paragraph",
        text: "Der er ikke nødvendigvis én enkelt årsag. Flere faktorer kan spille sammen, og derfor bør årsagen vurderes ud fra den enkelte persons symptomer, aktivitetsniveau og belastning.",
      },
      {
        type: "subheading",
        text: "Typiske faktorer ved patellofemorale smerter",
      },
      {
        type: "paragraph",
        text: "Flere forhold i forbindelse med aktivitet, træning og hverdag kan være medvirkende til, at symptomerne opstår eller forværres. Det gælder blandt andet:",
      },
      {
        type: "list",
        items: [
          "Hurtig stigning i mængden af løb, trapper eller knæbøjende aktivitet",
          "Nedsat styrke i lår, baller og hofte i forhold til belastningen",
          "Længere perioder med lav aktivitet efterfulgt af hurtig opstart",
          "Mange gentagne bøjninger af knæet under belastning",
          "Utilstrækkelig restitution i forhold til belastningen",
        ],
      },
    ],
  },

  selfManagement: {
    heading: "Hvad kan du gøre ved patellofemorale smerter?",
    blocks: [
      {
        type: "paragraph",
        text: "Ved patellofemorale smerter vil det ofte være relevant at se på de aktiviteter, der fremkalder symptomerne. Det betyder ikke nødvendigvis, at al aktivitet skal stoppes, men belastningen kan have behov for at blive tilpasset.",
      },
      {
        type: "paragraph",
        text: "Afhængigt af symptomerne kan det blandt andet være relevant at arbejde med:",
      },
      {
        type: "list",
        items: [
          "Tilpasning af de aktiviteter, der provokerer smerterne",
          "Styrketræning af lår, baller og hofte",
          "Gradvis progression i knæbøjende belastning",
          "Variation i siddestilling og pauser i løbet af dagen",
          "Gradvis tilbagevenden til løb og sport",
        ],
      },
      {
        type: "paragraph",
        text: "Hvad der passer til den enkelte afhænger blandt andet af symptomernes omfang, varighed og aktivitetsniveau.",
      },
    ],
  },

  exercises: {
    heading: "Gode øvelser til patellofemorale smerter",
    intro:
      "Træning kan være en relevant del af et forløb ved patellofemorale smerter. Øvelserne bør vælges og tilpasses efter symptomer, styrke og den belastning, du ønsker at vende tilbage til.",
    exerciseSlugs: [
      "spanish-squat",
      "leg-extension",
      "step-ups",
      "side-lying-hip-abduction",
      "glute-bridge",
    ],
    ctaLabel: "Se alle styrkeøvelser →",
    ctaHref: "/styrkeoevelser",
  },

  whenToSeekHelp: {
    heading: "Hvornår bør du søge hjælp til patellofemorale smerter?",
    blocks: [
      {
        type: "paragraph",
        text: "Det kan være relevant at få knæet undersøgt, hvis smerterne fortsætter, bliver værre eller gør det svært at træne, gå på trapper eller klare almindelige aktiviteter.",
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
          "Du er i tvivl om, hvad der ligger bag dine knæsmerter",
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
    heading: "Find en fysioterapeut til patellofemorale smerter",
    body: "Har dine knæsmerter betydning for din træning eller hverdag? På Fysfinder kan du finde fysioterapeuter og klinikker med relevante kompetencer og vælge en behandler, der passer til dit behov.",
    ctaLabel: "Find fysioterapeut →",
    specialtySlugs: ["knae"],
  },

  relatedConditions: {
    heading: "Andre problemstillinger, der kan give knæsmerter",
    intro:
      "Patellofemorale smerter er ikke den eneste problemstilling, der kan give gener foran på knæet. Hvis dine symptomer ikke passer på beskrivelsen, kan andre knæproblemer være relevante at læse om.",
    conditionSlugs: ["springerknae", "loeberknae", "artrose"],
  },

  seoContent: {
    heading: "Patellofemorale smerter og ondt foran på knæet",
    blocks: [
      {
        type: "paragraph",
        text: "Patellofemorale smerter er en af de mest almindelige årsager til smerter foran på knæet og ses hos både aktive og mindre aktive personer. Generne er ofte diffuse, og mange har svært ved at pege præcist på, hvor det gør ondt.",
      },
      {
        type: "paragraph",
        text: "Hvor hurtigt symptomerne opstår, og hvilke aktiviteter der provokerer dem, kan variere fra person til person.",
      },
      { type: "subheading", text: "Hvorfor gør det ondt bag knæskallen?" },
      {
        type: "paragraph",
        text: "Når knæet bøjes under belastning, øges trykket i området mellem knæskallen og lårbenet. Aktiviteter som trappegang, squat og løb øger derfor belastningen af området, og det kan være med til at forklare, hvorfor netop disse aktiviteter ofte fremkalder symptomerne.",
      },
      {
        type: "subheading",
        text: "Hvor lang tid tager patellofemorale smerter?",
      },
      {
        type: "paragraph",
        text: "Varigheden varierer og afhænger blandt andet af symptomernes omfang, hvor længe problemet har stået på og hvordan belastning og træning tilpasses. Der findes derfor ikke én bestemt tidsramme, der gælder for alle.",
      },
    ],
  },

  faq: {
    heading: "Ofte stillede spørgsmål om patellofemorale smerter",
    items: [
      {
        question: "Hvad er patellofemorale smerter?",
        answer: [
          "Patellofemorale smerter er en samlet betegnelse for smerter omkring eller bag knæskallen. Tilstanden omtales også som patellofemoralt smertesyndrom og er en af de mest almindelige årsager til smerter foran på knæet.",
        ],
      },
      {
        question: "Hvor sidder smerten ved patellofemorale smerter?",
        answer: [
          "Smerterne sidder typisk omkring eller bag knæskallen. De er ofte diffuse, og mange oplever, at det er svært at placere smerten præcist.",
        ],
      },
      {
        question: "Hvorfor gør mit knæ ondt, når jeg går ned ad trapper?",
        answer: [
          "Når du går ned ad trapper, bøjes knæet under belastning, og trykket omkring knæskallen øges. Det kan derfor være en af de situationer, hvor patellofemorale smerter mærkes tydeligst. Andre problemstillinger kan dog også give gener ved trappegang.",
        ],
      },
      {
        question:
          "Hvorfor gør mit knæ ondt efter at have siddet ned i lang tid?",
        answer: [
          "Længere tids siddende stilling med bøjet knæ kan for nogle give gener foran på knæet, og smerterne kan mærkes tydeligere, når man rejser sig. Det kan blandt andet forekomme ved patellofemorale smerter.",
        ],
      },
      {
        question: "Skal jeg holde helt op med at træne?",
        answer: [
          "Ikke nødvendigvis. Ved patellofemorale smerter kan det ofte være relevant at tilpasse de aktiviteter, der fremkalder symptomerne, frem for at stoppe al træning. Hvordan knæet bør belastes afhænger dog af den enkeltes symptomer.",
        ],
      },
      {
        question: "Hvilke øvelser er gode til patellofemorale smerter?",
        answer: [
          "Der findes ikke én bestemt øvelse, der passer til alle. Styrketræning af lår, baller og hofte bruges ofte, men valg og belastning bør tilpasses den enkelte.",
          `[Se øvelser til patellofemorale smerter →](#${CONDITION_SECTION_IDS.exercises})`,
        ],
      },
      {
        question:
          "Hvornår bør jeg gå til fysioterapeut med smerter foran på knæet?",
        answer: [
          "Det kan være relevant at opsøge en fysioterapeut, hvis smerterne fortsætter, kommer tilbage, begrænser din aktivitet eller hvis du er usikker på årsagen til dine knæsmerter.",
          "[Find en fysioterapeut →](/find/fysioterapeut/danmark/knae)",
        ],
      },
      {
        question:
          "Er patellofemorale smerter det samme som løberknæ?",
        answer: [
          "Nej. Løberknæ giver typisk smerter på ydersiden af knæet, mens patellofemorale smerter sidder omkring eller bag knæskallen. Begge problemstillinger kan opleves i forbindelse med løb, men placeringen af smerten er forskellig.",
        ],
      },
    ],
  },
};
