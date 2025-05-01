"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Answer } from "@/types/survey";
import {
  questions,
  answerOptions,
  calculateScore,
  resultCategories,
} from "@/lib/surveys/start-back-tool";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface StartBackToolClientProps {
  // Define any props needed from the server component, if any in the future
}

export function StartBackToolClient({}: StartBackToolClientProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const router = useRouter();

  const progress = useMemo(() => {
    return (answers.length / questions.length) * 100;
  }, [answers]);

  const handleAnswer = (
    questionId: string,
    answerId: string,
    score: number
  ) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const existingIndex = newAnswers.findIndex(
        (a) => a.questionId === questionId
      );

      const answer: Answer = {
        questionId,
        answer: answerId,
        score,
      };

      if (existingIndex >= 0) {
        newAnswers[existingIndex] = answer;
      } else {
        newAnswers.push(answer);
      }

      return newAnswers;
    });
  };

  const handleSubmit = () => {
    if (answers.length === questions.length) {
      const score = calculateScore(answers);
      const resultPath = resultCategories[score.riskLevel].path;
      router.push(resultPath);
    }
  };

  return (
    <>
      <div className="sticky top-14 sm:top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 py-4 border-b">
        <Progress value={progress} className="w-full bg-gray-200" />
        <p className="text-sm text-gray-500 mt-2">
          {answers.length} af {questions.length} spørgsmål besvaret
        </p>
      </div>

      <div className="space-y-4 mt-8">
        {/* Questions 1-8 */}
        {questions.slice(0, 8).map((question, index) => {
          const currentAnswer = answers.find(
            (a) => a.questionId === question.id
          )?.answer;
          const options = answerOptions.standard;

          return (
            <div key={question.id}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
                <p className="flex-1">
                  {index + 1}. {question.text}
                </p>
                <div className="flex gap-2 sm:min-w-[200px] justify-end">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() =>
                        handleAnswer(question.id, option.id, option.score)
                      }
                      className={cn(
                        "flex-1 sm:flex-initial inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
                        "h-10 px-6",
                        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:pointer-events-none disabled:opacity-50",
                        currentAnswer === option.id &&
                          "bg-gray-800 text-white hover:bg-gray-800/90 hover:text-white"
                      )}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
            </div>
          );
        })}

        {/* Question 9 (special case) */}
        {questions.slice(8, 9).map((question, index) => {
          const currentAnswer = answers.find(
            (a) => a.questionId === question.id
          )?.answer;
          const options = answerOptions.q9;

          return (
            <div key={question.id} className="mt-8 space-y-4">
              <p>9. {question.text}</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      handleAnswer(question.id, option.id, option.score)
                    }
                    className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
                      "px-4 py-2",
                      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:pointer-events-none disabled:opacity-50",
                      currentAnswer === option.id &&
                        "bg-gray-800 text-white hover:bg-gray-800/90 hover:text-white"
                    )}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <div>
          <Button
            onClick={handleSubmit}
            disabled={answers.length !== questions.length}
            className="w-full bg-logo-blue hover:bg-logo-blue/90 mt-8 h-14 text-lg"
          >
            Se resultat
          </Button>
        </div>
      </div>
    </>
  );
}
