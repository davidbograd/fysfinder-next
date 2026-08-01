import type { LinkMapping } from "./types.js";

export const miscMappings: LinkMapping[] = [
  {
    keywords: [
      "Fysioterapi",
      "Find fysioterapeut",
      "Fysioterapeut",
      "Find fysioterapi",
    ],
    destination: "/",
  },
  {
    keywords: ["MR scanning", "MR-scanning", "MR-scan", "MR scan", "MRI"],
    destination: "/mr-scanning",
  },
  {
    keywords: [
      "DEXA scanning",
      "DEXA-scanning",
      "DEXA-scan",
      "DEXA scan",
      "dexa scanning",
    ],
    destination: "/dexa-scanning",
  },
  {
    keywords: [
      "STarT Back",
      "START Back",
      "Start Back Screening",
      "rygsmerte-test",
      "test dine rygsmerter",
    ],
    destination: "/start-back-screening-tool",
  },
  {
    keywords: ["BMI-beregner", "BMI beregner", "BMI-beregningen"],
    destination: "/vaerktoejer/bmi-beregner",
  },
  {
    keywords: [
      "kalorieberegner",
      "Kalorieberegner",
      "kalorie-beregner",
      "kalorie beregner",
    ],
    destination: "/vaerktoejer/kalorieberegner",
  },
  {
    keywords: [
      "fedtprocent-beregner",
      "fedtprocent beregner",
      "Fedtprocent beregner",
      "fedtprocentberegner",
    ],
    destination: "/vaerktoejer/fedtprocent-beregner",
  },
  {
    keywords: [
      "pace-beregner",
      "pace beregner",
      "Pace beregner",
      "løbehastighed-beregner",
    ],
    destination: "/vaerktoejer/pace-beregner",
  },
  {
    keywords: [
      "RM-beregner",
      "RM beregner",
      "1RM-beregner",
      "1RM beregner",
      "rep max beregner",
    ],
    destination: "/vaerktoejer/rm-beregner",
  },
];
