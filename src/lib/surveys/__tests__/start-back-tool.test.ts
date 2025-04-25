import { calculateScore } from "../start-back-tool";
import { Answer } from "@/types/survey";

describe("STarT Back Tool Scoring", () => {
  // Helper function to create answers
  const createAnswer = (
    questionId: string,
    answer: string,
    score: number
  ): Answer => ({
    questionId,
    answer,
    score,
  });

  describe("Total Score Calculation", () => {
    it("should calculate low risk (score ≤ 3)", () => {
      const answers: Answer[] = [
        createAnswer("q1", "totally_agree", 1), // Physical: 1
        createAnswer("q2", "disagree", 0), // Physical: 0
        createAnswer("q3", "disagree", 0), // Physical: 0
        createAnswer("q4", "disagree", 0), // Physical: 0
        createAnswer("q5", "disagree", 0), // Psychosocial: 0
        createAnswer("q6", "disagree", 0), // Psychosocial: 0
        createAnswer("q7", "disagree", 0), // Psychosocial: 0
        createAnswer("q8", "disagree", 0), // Psychosocial: 0
        createAnswer("q9", "disagree", 0), // Psychosocial: 0 (special case)
      ];

      const result = calculateScore(answers);
      expect(result.totalScore).toBe(1);
      expect(result.psychosocialScore).toBe(0);
      expect(result.riskLevel).toBe("low");
    });

    it("should calculate medium risk (total ≥ 4, psychosocial < 4)", () => {
      const answers: Answer[] = [
        createAnswer("q1", "totally_agree", 1), // Physical: 1
        createAnswer("q2", "totally_agree", 1), // Physical: 1
        createAnswer("q3", "totally_agree", 1), // Physical: 1
        createAnswer("q4", "totally_agree", 1), // Physical: 1
        createAnswer("q5", "disagree", 0), // Psychosocial: 0
        createAnswer("q6", "disagree", 0), // Psychosocial: 0
        createAnswer("q7", "disagree", 0), // Psychosocial: 0
        createAnswer("q8", "disagree", 0), // Psychosocial: 0
        createAnswer("q9", "disagree", 0), // Psychosocial: 0 (special case)
      ];

      const result = calculateScore(answers);
      expect(result.totalScore).toBe(4);
      expect(result.psychosocialScore).toBe(0);
      expect(result.riskLevel).toBe("medium");
    });

    it("should calculate high risk (total ≥ 4, psychosocial ≥ 4)", () => {
      const answers: Answer[] = [
        createAnswer("q1", "disagree", 0), // Physical: 0
        createAnswer("q2", "disagree", 0), // Physical: 0
        createAnswer("q3", "disagree", 0), // Physical: 0
        createAnswer("q4", "disagree", 0), // Physical: 0
        createAnswer("q5", "totally_agree", 1), // Psychosocial: 1
        createAnswer("q6", "totally_agree", 1), // Psychosocial: 1
        createAnswer("q7", "totally_agree", 1), // Psychosocial: 1
        createAnswer("q8", "totally_agree", 1), // Psychosocial: 1
        createAnswer("q9", "totally_agree", 0), // Psychosocial: 1 (special case)
      ];

      const result = calculateScore(answers);
      expect(result.totalScore).toBe(5);
      expect(result.psychosocialScore).toBe(5);
      expect(result.riskLevel).toBe("high");
    });
  });

  describe("Special Q9 Handling", () => {
    it('should only score Q9 as 1 for "totally_agree"', () => {
      // Test with "totally_agree"
      const answersWithTotallyAgree: Answer[] = Array(8)
        .fill(null)
        .map((_, i) => createAnswer(`q${i + 1}`, "disagree", 0))
        .concat([createAnswer("q9", "totally_agree", 0)]);

      const resultTotallyAgree = calculateScore(answersWithTotallyAgree);
      expect(resultTotallyAgree.totalScore).toBe(1);
      expect(resultTotallyAgree.psychosocialScore).toBe(1);

      // Test with "agree"
      const answersWithAgree = Array(8)
        .fill(null)
        .map((_, i) => createAnswer(`q${i + 1}`, "disagree", 0))
        .concat([createAnswer("q9", "agree", 0)]);

      const resultAgree = calculateScore(answersWithAgree);
      expect(resultAgree.totalScore).toBe(0);
      expect(resultAgree.psychosocialScore).toBe(0);
    });
  });
});
