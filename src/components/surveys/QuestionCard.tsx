import React from "react";
import { Question, AnswerOption, Answer } from "@/types/survey";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuestionCardProps {
  question: Question;
  answerOptions: AnswerOption[];
  currentAnswer?: string;
  onAnswerChange: (answer: Answer) => void;
}

export function QuestionCard({
  question,
  answerOptions,
  currentAnswer,
  onAnswerChange,
}: QuestionCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{question.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={currentAnswer}
          onValueChange={(value) => {
            const selectedOption = answerOptions.find(
              (opt) => opt.id === value
            );
            if (selectedOption) {
              onAnswerChange({
                questionId: question.id,
                answer: value,
                score: selectedOption.score,
              });
            }
          }}
        >
          {answerOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2 py-2">
              <RadioGroupItem
                value={option.id}
                id={`${question.id}-${option.id}`}
              />
              <Label htmlFor={`${question.id}-${option.id}`}>
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
