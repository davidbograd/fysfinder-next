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

export const answerOptions: AnswerOption[] = [
  { id: "totally_agree", text: "Helt enig", score: 1 },
  { id: "agree", text: "Enig", score: 1 },
  { id: "neutral", text: "Hverken enig eller uenig", score: 0 },
  { id: "disagree", text: "Uenig", score: 0 },
  { id: "totally_disagree", text: "Helt uenig", score: 0 },
];

export const resultCategories: Record<string, ResultCategory> = {
  low: {
    name: "Lav risiko",
    description: "Total score ≤ 3",
    recommendation:
      "Denne score indikerer lav risiko for udvikling af vedvarende rygsmerter. Generel rådgivning og selvhjælpsstrategier anbefales.",
  },
  medium: {
    name: "Mellem risiko",
    description: "Total score ≥ 4 og psykosocial score < 4",
    recommendation:
      "Denne score indikerer moderat risiko. Fysioterapi og målrettet behandling kan være gavnlig.",
  },
  high: {
    name: "Høj risiko",
    description: "Total score ≥ 4 og psykosocial score ≥ 4",
    recommendation:
      "Denne score indikerer høj risiko. En kombineret fysisk og psykologisk tilgang anbefales, evt. med henvisning til specialist.",
  },
};

export function calculateScore(answers: Answer[]): StartBackScore {
  // Special handling for Q9 (only "Helt enig" scores 1)
  const q9Score =
    answers.find((a) => a.questionId === "q9")?.answer === "totally_agree"
      ? 1
      : 0;

  // Calculate total score (questions 1-8 normal scoring + special Q9 scoring)
  const totalScore =
    answers
      .filter((a) => a.questionId !== "q9")
      .reduce((sum, answer) => sum + answer.score, 0) + q9Score;

  // Calculate psychosocial score (Q5-Q9)
  const psychosocialScore =
    answers
      .filter((a) => ["q5", "q6", "q7", "q8"].includes(a.questionId))
      .reduce((sum, answer) => sum + answer.score, 0) + q9Score;

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
