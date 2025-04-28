import {
  Question,
  AnswerOption,
  Answer,
  StartBackScore,
  ResultCategory,
} from "@/types/survey";

// Updated standard answer options order to 'Nej' before 'Ja' as of [date].
export const questions: Question[] = [
  {
    id: "q1",
    text: "I løbet af de seneste 2 uger har mine rygsmerter bredt sig ned i mit/mine ben",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q2",
    text: "Jeg har haft smerter i mine skuldre eller nakke i løbet af de seneste 2 uger",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q3",
    text: "Jeg har kun gået korte afstande på grund af mine rygsmerter",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q4",
    text: "I løbet af de seneste 2 uger har jeg klædt mig langsommere på end normalt på grund af rygsmerter",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q5",
    text: "Jeg føler det er usikkert for en person i min tilstand at være fysisk aktiv",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q6",
    text: "Mine rygsmerter gør mig bekymret meget af tiden",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q7",
    text: "Jeg føler mine rygsmerter er forfærdelige, og de aldrig bliver bedre",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q8",
    text: "Jeg har generelt haft svært ved at nyde alle de ting, som jeg plejer at nyde",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q9",
    text: "Hvor generende har dine rygsmerter været de seneste 2 uger?",
    type: "SINGLE_CHOICE",
    required: true,
  },
];

export const answerOptions: Record<string, AnswerOption[]> = {
  standard: [
    { id: "no", text: "Nej", score: 0 },
    { id: "yes", text: "Ja", score: 1 },
  ],
  q9: [
    { id: "not_at_all", text: "Slet ikke", score: 0 },
    { id: "a_little", text: "Lidt", score: 1 },
    { id: "moderate", text: "Middel", score: 2 },
    { id: "very", text: "Meget", score: 3 },
    { id: "extreme", text: "Ekstremt", score: 4 },
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
        text: "Find fysioterapeut specialiseret i ryg",
        textMobile: "Find specialist i ryg",
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
        text: "Find fysioterapeut specialiseret i kroniske smerter",
        textMobile: "Find specialist i kroniske smerter",
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
