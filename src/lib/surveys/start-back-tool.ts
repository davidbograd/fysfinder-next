import {
  Question,
  AnswerOption,
  Answer,
  StartBackScore,
  ResultCategory,
} from "@/types/survey";

export const questions: Question[] = [
  {
    id: "q1",
    text: "Jeg har haft smerter i det ene eller begge ben i forbindelse med mine rygsmerter.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q2",
    text: "Jeg har haft smerter i skulderen eller nakken i forbindelse med mine rygsmerter.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q3",
    text: "Mine rygsmerter har gjort det svært for mig at gå.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q4",
    text: "Mine rygsmerter har gjort det vanskeligt for mig at rejse mig fra en stol.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q5",
    text: "Mine rygsmerter har påvirket mit daglige arbejde, ude eller hjemme.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q6",
    text: "Jeg har været bekymret på grund af mine rygsmerter.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q7",
    text: "Mine rygsmerter har fået mig til at føle mig anspændt eller stresset.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q8",
    text: "Generelt har jeg haft det dårligt på grund af mine rygsmerter.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q9",
    text: "I løbet af de sidste to uger har jeg tænkt, at min ryg måske aldrig bliver bedre.",
    type: "SINGLE_CHOICE",
    required: true,
  },
];

export const answerOptions: Record<string, AnswerOption[]> = {
  standard: [
    { id: "agree", text: "Enig", score: 1 },
    { id: "disagree", text: "Uenig", score: 0 },
  ],
  q9: [
    { id: "totally_agree", text: "Helt enig", score: 1 },
    { id: "agree", text: "Enig", score: 1 },
    { id: "neutral", text: "Hverken enig eller uenig", score: 0 },
    { id: "disagree", text: "Uenig", score: 0 },
    { id: "totally_disagree", text: "Helt uenig", score: 0 },
  ],
};

export const resultCategories: Record<string, ResultCategory> = {
  low: {
    name: "Lav risiko",
    description: "Total score ≤ 3",
    recommendation:
      "Dine rygsmerter virker helt ufarlige - og bør gå væk helt af sig selv! Hvis du ikke har fået det bedre i løbet af 14 dage, så er det en god idé at finde en behandler.\n\nHvis du gerne vil forstå dine rygsmerter, og hvad du selv kan gøre.",
    actions: [
      {
        text: "Læs mere om lændesmerter",
        url: "https://www.fysfinder.dk/ordbog/laendesmerter",
      },
    ],
    path: "/start-back-screening-tool/lav",
  },
  medium: {
    name: "Mellem risiko",
    description: "Total score ≥ 4 og psykosocial score < 4",
    recommendation:
      "Dine rygsmerter kan have godt af at blive behandlet af en fysioterapeut, så de kan finde årsagen og opstarte det rigtige behandlingsforløb for dig.",
    actions: [
      {
        text: "Find ryg fysioterapeut",
        url: "https://www.fysfinder.dk/find/fysioterapeut/danmark/ryg",
      },
    ],
    path: "/start-back-screening-tool/medium",
  },
  high: {
    name: "Høj risiko",
    description: "Total score ≥ 4 og psykosocial score ≥ 4",
    recommendation:
      "Det er vigtigt at du får hjælp til at tage hånd om dine rygsmerter! Din smerte påvirker dig fysisk og psykisk i løbet af hverdagen, og du har derfor brug for hjælp fra en fysioterapeut specialiseret i kroniske smerter.",
    actions: [
      {
        text: "Find kroniske smerte fysioterapeut",
        url: "https://www.fysfinder.dk/find/fysioterapeut/danmark/kroniske-smerter",
      },
    ],
    path: "/start-back-screening-tool/hoej",
  },
};

export function calculateScore(answers: Answer[]): StartBackScore {
  // Calculate total score for questions 1-8
  const standardQuestionsScore = answers
    .filter((a) => a.questionId !== "q9")
    .reduce((sum, answer) => sum + answer.score, 0);

  // Special handling for Q9 (only "Helt enig" and "Enig" score 1)
  const q9Answer = answers.find((a) => a.questionId === "q9")?.answer;
  const q9Score = q9Answer === "totally_agree" || q9Answer === "agree" ? 1 : 0;

  const totalScore = standardQuestionsScore + q9Score;

  // Calculate psychosocial score (Q5-Q9)
  const psychosocialQuestionsScore = answers
    .filter((a) => ["q5", "q6", "q7", "q8"].includes(a.questionId))
    .reduce((sum, answer) => sum + answer.score, 0);

  const psychosocialScore = psychosocialQuestionsScore + q9Score;

  // Determine risk level
  let riskLevel: "low" | "medium" | "high";
  if (totalScore <= 3) {
    riskLevel = "low";
  } else if (psychosocialScore < 4) {
    riskLevel = "medium";
  } else {
    riskLevel = "high";
  }

  return {
    totalScore,
    psychosocialScore,
    riskLevel,
  };
}
