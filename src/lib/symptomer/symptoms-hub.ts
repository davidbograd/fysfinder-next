// Added: 2026-09-07 - Approved copy for the /symptomer hub (level 1) kept out of the UI components.

import type { SymptomsHubContent } from "./types";

export const symptomsHub: SymptomsHubContent = {
  metaTitle: "Har du symptomer og smerter? → Få svar og den rette hjælp",
  metaDescription:
    "Har du smerter eller gener? Vælg hvor du har ondt, bliv klogere på dine symptomer og find relevante øvelser og fysioterapeuter, der kan hjælpe.",

  h1: "Symptomer og smerter – få svar og hjælp til at komme af med dine gener",
  heroIntro:
    "Har du symptomer, smerter eller gener et sted i kroppen? Find dit kropsområde og bliv guidet videre til relevante problemstillinger, øvelser og fysioterapeuter, der kan hjælpe.",

  bodyAreaGridHeading: "Vælg, hvor du har ondt",

  journey: {
    heading: "Sådan kommer du i gang",
    steps: [
      {
        title: "Find dit kropsområde",
        description: "Vælg hvor du oplever smerter eller gener.",
      },
      {
        title: "Bliv klogere på dit problem",
        description: "Se relevante problemstillinger og øvelser.",
      },
      {
        title: "Find en fysioterapeut",
        description:
          "Find behandlere med erfaring inden for netop dit problem.",
      },
    ],
  },

  disclaimer:
    "Fysfinder kan hjælpe dig med at forstå dine symptomer, men indholdet kan ikke erstatte en individuel undersøgelse eller diagnose hos en sundhedsprofessionel.",

  bodyAreaNavigation: {
    heading: "Udforsk symptomer og smerter efter kropsområde",
  },

  popularConditions: {
    heading: "Typiske problemstillinger – bliv klogere på dine gener",
    conditionSlugs: [
      "loeberknae",
      "springerknae",
      "meniskskade",
      "artrose",
      "patellofemorale-smerter",
    ],
  },

  seoContent: {
    heading: "Bliv klogere på dine smerter og symptomer",
    blocks: [
      {
        type: "paragraph",
        text: "Smerter og andre gener fra kroppen kan opstå af mange forskellige årsager. Nogle smerter kommer pludseligt efter en skade eller belastning, mens andre udvikler sig gradvist over tid. Hvor du har ondt, hvornår smerterne opstår, og hvilke andre symptomer du oplever, kan være med til at pege på, hvilke problemstillinger der er relevante at undersøge nærmere.",
      },
      { type: "subheading", text: "Hvor har du ondt? Forstå dine symptomer" },
      {
        type: "paragraph",
        text: "Det første skridt er ofte at tage udgangspunkt i det område af kroppen, hvor du oplever dine gener. Smerter i eksempelvis **knæ, ryg, lænd, skulder, hofte eller nakke** kan have forskellige årsager og vise sig på forskellige måder. I Fysfinders symptomunivers kan du vælge dit kropsområde og blive guidet videre til symptomer og problemstillinger, der er relevante for netop dette område.",
      },
      {
        type: "subheading",
        text: "Fra symptomer til øvelser og den rette professionelle hjælp",
      },
      {
        type: "paragraph",
        text: "Når du har fundet en relevant problemstilling, kan du læse mere om typiske symptomer, mulige årsager og hvad du selv kan gøre. Hvor det er relevant, guider vi dig også videre til [styrkeøvelser og træning](/styrkeoevelser), som kan indgå i arbejdet med den pågældende problemstilling.",
      },
      {
        type: "paragraph",
        text: "Har du brug for at få dine gener undersøgt, kan du bruge Fysfinder til at finde fysioterapeuter med relevante specialer og kompetencer og vælge en klinik, der passer til dit behov.",
      },
      {
        type: "paragraph",
        text: "[Find den rette fysioterapeut →](/find/fysioterapeut/danmark)",
      },
    ],
  },
};
