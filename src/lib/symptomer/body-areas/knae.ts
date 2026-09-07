// Added: 2026-09-07 - Knee body area: hub teaser plus all approved content for /symptomer/knae.

import { BODY_AREA_SECTION_IDS } from "../constants";
import type { ActiveBodyArea } from "../types";

export const knae: ActiveBodyArea = {
  slug: "knae",
  name: "Knæ",
  description:
    "Smerter og gener i og omkring knæleddet, knæskallen og knæets sener.",
  isActive: true,

  hub: {
    heading: "Knæsymptomer",
    description:
      "Ondt i knæet kan blandt andet opleves foran, bagved, på siden eller omkring knæskallen. Udforsk symptomer og problemstillinger relateret til knæet.",
    ctaLabel: "Se symptomer og smerter i knæet →",
    popularConditionSlugs: [
      "loeberknae",
      "springerknae",
      "meniskskade",
      "artrose",
    ],
  },

  page: {
    metaTitle: "Ondt i knæet? → Symptomer, mulige årsager og hjælp",
    metaDescription:
      "Har du ondt i knæet? Bliv klogere på dine symptomer, se typiske årsager og problemstillinger, find relevante knæøvelser og fysioterapeuter.",
    h1: "Ondt i knæet? Bliv klogere på dine knæsmerter og få den rette hjælp",
    heroIntro:
      "Knæsmerter kan opleves forskelligt afhængigt af, hvor smerten sidder, hvornår den opstår, og hvad der udløser den. Her på Fysfinder kan du udforske dine symptomer og blive guidet videre til relevante problemstillinger, øvelser og professionel hjælp.",
    heroConditionLimit: 5,

    painLocations: {
      heading: "Knæsmerter – hvor i knæet har du ondt?",
      intro:
        "Hvor smerten sidder kan give en indikation af, hvilke problemstillinger der kan være relevante at læse mere om. Udforsk det område, der bedst beskriver dine smerter.",
      cards: [
        {
          id: "foran-paa-knaeet",
          title: "Foran på knæet",
          description:
            "Oplever du smerter foran på knæet, kan flere forskellige strukturer og problemstillinger være involveret.",
          conditionSlugs: [
            "patellofemorale-smerter",
            "springerknae",
            "artrose",
          ],
        },
        {
          id: "ydersiden-af-knaeet",
          title: "På ydersiden af knæet",
          description:
            "Smerter på ydersiden af knæet kan blandt andet opstå i forbindelse med løb eller anden gentagen belastning.",
          conditionSlugs: ["loeberknae"],
        },
        {
          id: "indersiden-af-knaeet",
          title: "På indersiden af knæet",
          description:
            "Smerter på indersiden af knæet kan opstå ved flere forskellige former for belastning eller skade.",
          conditionSlugs: ["meniskskade", "artrose"],
        },
        {
          id: "bag-knaeet",
          title: "Bag knæet",
          description:
            "Smerter bag knæet kan opstå af flere forskellige årsager og kan blandt andet være relateret til muskler, sener eller andre strukturer omkring knæet.",
          conditionSlugs: [],
        },
        {
          id: "omkring-knaeskallen",
          title: "Omkring knæskallen",
          description:
            "Smerter omkring eller bag knæskallen kan blandt andet mærkes ved trapper, squat eller længere tids siddende stilling.",
          conditionSlugs: ["patellofemorale-smerter", "artrose"],
        },
      ],
    },

    symptomContexts: {
      heading: "Hvornår oplever du smerter i knæet?",
      intro:
        "Hvornår smerterne opstår, kan sige noget om, hvad der belaster knæet. Genkend din situation og se, hvilke problemstillinger der kan være relevante at læse mere om.",
      cards: [
        {
          id: "ved-loeb",
          title: "Ondt i knæet ved løb",
          description:
            "Knæsmerter under eller efter løb kan blandt andet være relateret til gentagen belastning.",
          conditionSlugs: ["loeberknae", "patellofemorale-smerter"],
        },
        {
          id: "ved-trapper",
          title: "Ondt i knæet ved trapper",
          description:
            "Smerter ved trappegang opleves blandt andet ved flere problemstillinger omkring knæskallen.",
          conditionSlugs: ["patellofemorale-smerter", "artrose"],
        },
        {
          id: "ved-boejning",
          title: "Ondt i knæet når du bøjer det",
          description:
            "Smerter ved bøjning af knæet kan opleves ved forskellige former for knæproblemer.",
          conditionSlugs: ["meniskskade", "patellofemorale-smerter"],
        },
        {
          id: "haevet-og-stift-knae",
          title: "Hævet og stift knæ",
          description:
            "Hævelse og stivhed kan forekomme ved flere forskellige problemstillinger i knæet.",
          conditionSlugs: ["artrose", "meniskskade"],
        },
        {
          id: "knae-der-klikker-eller-laaser",
          title: "Knæ der klikker eller låser",
          description:
            "Klik, knæk eller fornemmelsen af at knæet låser kan være relevant at undersøge nærmere.",
          conditionSlugs: ["meniskskade"],
        },
      ],
    },

    conditionGrid: {
      heading: "Typiske problemstillinger ved knæsmerter",
      intro:
        "Herunder finder du de problemstillinger i knæet, du kan læse mere om på Fysfinder.",
    },

    exercises: {
      heading: "Øvelser til knæ og knæsmerter",
      intro:
        "Træning kan være relevant ved mange former for knæsmerter. Hvilke øvelser der passer til dig afhænger dog af din problemstilling, dit niveau og dine symptomer.",
      exerciseSlugs: [
        "step-ups",
        "split-squat",
        "spanish-squat",
        "terminal-knee-extension-tke",
        "leg-extension",
        "leg-curls",
      ],
      ctaLabel: "Se alle øvelser til knæet →",
      ctaHref: "/styrkeoevelser/knae",
    },

    findPhysio: {
      heading: "Få professionel hjælp til dine knæsmerter",
      body: "Har du vedvarende knæsmerter, eller er du i tvivl om, hvad der ligger bag dine symptomer? En fysioterapeut kan undersøge dit knæ og hjælpe dig med at finde den rette vej videre.",
      ctaLabel: "Find fysioterapeut →",
      specialtySlugs: ["knae"],
    },

    seoContent: {
      heading: "Ondt i knæet – forstå dine symptomer",
      blocks: [
        {
          type: "paragraph",
          text: "Knæsmerter kan opstå både pludseligt og gradvist og kan skyldes mange forskellige forhold. Nogle oplever smerter efter sport eller anden fysisk aktivitet, mens andre får ondt i knæet ved almindelige bevægelser som gang, trappegang eller når knæet bøjes.",
        },
        {
          type: "paragraph",
          text: "Hvor smerten sidder, og hvornår den opstår, kan give information om, hvilke problemstillinger der kan være relevante at undersøge nærmere.",
        },
        { type: "subheading", text: "Hvorfor gør mit knæ ondt?" },
        {
          type: "paragraph",
          text: "Smerter i knæet kan blandt andet være forbundet med belastning, træning, skader eller forandringer i og omkring knæleddet. Løberknæ, springerknæ, patellofemorale smerter, meniskskader og artrose er eksempler på problemstillinger, der kan give forskellige former for knæsmerter.",
        },
        {
          type: "paragraph",
          text: "Symptomer alene kan dog ikke afgøre årsagen til smerterne.",
        },
        { type: "subheading", text: "Hvad kan jeg gøre ved knæsmerter?" },
        {
          type: "paragraph",
          text: "Hvad der er relevant at gøre afhænger af årsagen og graden af dine gener. Ved mange knæproblemer kan tilpasset aktivitet og træning være relevant.",
        },
        {
          type: "paragraph",
          text: `På Fysfinder kan du læse om forskellige [knæproblemer](#${BODY_AREA_SECTION_IDS.conditions}), finde [øvelser til knæet](/styrkeoevelser/knae) og finde en [fysioterapeut](/find/fysioterapeut/danmark/knae), hvis du har brug for en individuel vurdering.`,
        },
      ],
    },

    faq: {
      heading: "Ofte stillede spørgsmål om knæsmerter",
      items: [
        {
          question: "Hvorfor har jeg ondt i knæet?",
          answer: [
            "Der kan være mange forskellige årsager til knæsmerter. Smerterne kan blandt andet opstå efter en skade, som følge af gentagen belastning eller i forbindelse med forandringer i knæets led, sener, menisker eller andre strukturer. Problemstillinger som løberknæ, springerknæ, patellofemorale smerter, meniskskade og artrose kan alle give knæsmerter, men symptomerne varierer fra person til person.",
          ],
        },
        {
          question:
            "Kan man se på placeringen af smerten, hvad der er galt med knæet?",
          answer: [
            "Hvor i knæet du har ondt kan give information om, hvilke strukturer eller problemstillinger der kan være relevante at undersøge. Smerter på ydersiden ses eksempelvis ofte ved løberknæ, mens smerter omkring knæskallen kan forekomme ved andre problemstillinger. Placeringen af smerten kan dog ikke alene bruges til at stille en diagnose.",
          ],
        },
        {
          question: "Hvorfor har jeg ondt foran på knæet?",
          answer: [
            "Smerter foran på knæet eller omkring knæskallen kan opstå ved flere forskellige problemstillinger. Det kan blandt andet være relateret til patellofemorale smerter eller irritation af patellarsenen, som ses ved springerknæ. Hvornår smerten opstår, og hvilke aktiviteter der provokerer den, er derfor også relevant at se på.",
          ],
        },
        {
          question: "Hvorfor har jeg ondt på ydersiden af knæet?",
          answer: [
            "Smerter på ydersiden af knæet kan blandt andet være forbundet med løberknæ. Ved løberknæ opstår smerterne typisk i forbindelse med løb eller anden gentagen belastning og mærkes karakteristisk på ydersiden af knæet. Andre problemstillinger kan dog også give smerter i området.",
          ],
        },
        {
          question: "Hvorfor har jeg ondt på indersiden af knæet?",
          answer: [
            "Smerter på indersiden af knæet kan have flere forskellige årsager. Blandt andet kan den mediale menisk, ledbånd eller andre strukturer på indersiden af knæet være involveret. Derfor bør smertens placering ses sammen med eksempelvis belastning, eventuelle vrid, hævelse og andre symptomer.",
          ],
        },
        {
          question: "Hvorfor har jeg ondt bag knæet?",
          answer: [
            "Smerter bag knæet kan komme fra forskellige strukturer. Blandt mulige årsager findes irritation omkring sener, meniskproblemer eller en Baker-cyste, men smerter kan også stamme fra andre områder. Ved vedvarende, kraftige eller pludseligt opståede smerter bør knæet vurderes individuelt.",
          ],
        },
        {
          question: "Hvorfor gør mit knæ ondt, når jeg går på trapper?",
          answer: [
            "Trappegang belaster knæet på en anden måde end almindelig gang, og smerter ved trapper kan derfor opleves ved flere knæproblemer. Det ses blandt andet ved problemstillinger omkring knæskallen og kan også forekomme ved springerknæ, meniskskader og artrose.",
          ],
        },
        {
          question: "Hvorfor får jeg ondt i knæet, når jeg løber?",
          answer: [
            "Knæsmerter under eller efter løb kan blandt andet opstå, når belastningen overstiger det, som vævet omkring knæet aktuelt kan tåle. Smerter på ydersiden under løb er karakteristiske ved løberknæ, mens andre former for løberelaterede knæsmerter kan have andre årsager.",
          ],
        },
        {
          question: "Hvad betyder det, hvis mit knæ klikker eller låser?",
          answer: [
            "Klik og knæk i knæet kan have forskellige forklaringer og er ikke nødvendigvis tegn på en skade. Hvis knæet derimod reelt låser, så bevægeligheden bliver begrænset, kan det blandt andet forekomme ved en meniskskade. Et aflåst knæ bør vurderes af en læge.",
          ],
        },
        {
          question: "Hvad kan hævelse og stivhed i knæet skyldes?",
          answer: [
            "Hævelse og stivhed kan forekomme ved flere forskellige knæproblemer. Hævelse kan eksempelvis opstå efter en skade eller ved irritation i knæleddet, mens stivhed blandt andet kan ses ved artrose. Hurtig og kraftig hævelse efter en akut skade bør undersøges nærmere.",
          ],
        },
        {
          question: "Hvilke øvelser er gode mod knæsmerter?",
          answer: [
            "Der findes ikke én øvelse, der passer til alle former for knæsmerter. Den relevante træning afhænger blandt andet af problemstillingen, symptomerne og dit nuværende aktivitetsniveau. Styrke- og bevægetræning bruges ved flere former for knæproblemer, men belastningen bør tilpasses den enkelte.",
            "På Fysfinder kan du finde trin-for-trin guides til [øvelser for knæet](/styrkeoevelser/knae).",
          ],
        },
        {
          question: "Skal jeg holde mit knæ helt i ro, hvis det gør ondt?",
          answer: [
            "Ikke nødvendigvis. Ved mange knæproblemer kan det være relevant at justere den aktivitet, der fremprovokerer smerterne, frem for at stoppe al bevægelse. Hvordan knæet bør belastes afhænger dog af årsagen til smerterne. Efter en akut skade eller ved kraftige symptomer kan der være behov for en individuel vurdering.",
          ],
        },
        {
          question: "Hvornår bør jeg gå til fysioterapeut med knæsmerter?",
          answer: [
            "Det kan være relevant at opsøge en fysioterapeut, hvis knæsmerterne bliver ved med at komme tilbage, begrænser dine normale aktiviteter eller gør det svært at træne og bevæge dig som normalt. En fysioterapeut kan undersøge blandt andet bevægelighed, styrke, belastning og funktion og hjælpe med at tilrettelægge et relevant forløb.",
            "[Find en fysioterapeut →](/find/fysioterapeut/danmark/knae)",
          ],
        },
        {
          question: "Hvornår bør knæsmerter vurderes hurtigt af en læge?",
          answer: [
            "Du bør søge lægelig vurdering ved blandt andet alvorlige akutte skader, mistanke om brud eller infektion, et reelt aflåst knæ, markant nedsat bevægelighed eller hurtig og kraftig hævelse efter en skade. Ved tvivl om alvorlige eller pludseligt opståede symptomer bør du søge professionel vurdering frem for at forsøge at finde årsagen alene online.",
          ],
        },
        {
          question: "Kan Fysfinder fortælle mig, hvilken knæskade jeg har?",
          answer: [
            "Nej. Symptomer som placering af smerter, hævelse, aktivitet og bevægelse kan hjælpe med at finde problemstillinger, der er relevante at læse mere om, men de kan ikke alene afgøre, hvad der er årsagen til dine smerter.",
            "Fysfinders symptomunivers er derfor lavet til at hjælpe dig med at **forstå dine symptomer og finde relevant information, øvelser og professionel hjælp – ikke til at stille en diagnose**.",
          ],
        },
      ],
    },
  },
};
