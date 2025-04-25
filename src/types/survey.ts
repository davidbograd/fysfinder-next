export type QuestionType = "SINGLE_CHOICE";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
}

export interface AnswerOption {
  id: string;
  text: string;
  score: number;
}

export interface Answer {
  questionId: string;
  answer: string;
  score: number;
}

export interface StartBackScore {
  totalScore: number;
  psychosocialScore: number;
  riskLevel: "low" | "medium" | "high";
}

export interface SurveyResponse {
  id: string;
  createdAt: Date;
  answers: Answer[];
  results: StartBackScore;
}

export interface ResultCategory {
  name: string;
  description: string;
  recommendation: string;
}
