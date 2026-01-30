import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Question } from "@/lib/diagnostic-questions";
import { LikertScale } from "./LikertScale";
import { ProgressBar } from "./ProgressBar";

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  currentValue?: number;
  onAnswer: (questionId: string, score: number) => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  currentValue,
  onAnswer,
  onPrevious,
  canGoPrevious
}: QuestionCardProps) {
  const handleSelect = (score: number) => {
    // Pequeno delay para feedback visual antes de avançar
    setTimeout(() => {
      onAnswer(question.id, score);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header fixo com progresso */}
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b z-10 p-4">
        <ProgressBar
          currentQuestion={currentIndex + 1}
          totalQuestions={totalQuestions}
          currentDimension={question.dimension}
        />
      </div>

      {/* Conteúdo centralizado */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center pb-2">
            <div className="text-sm text-muted-foreground mb-2">
              {question.dimension}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <p className="text-xl md:text-2xl font-medium text-center leading-relaxed">
              "{question.question_text}"
            </p>

            <LikertScale
              value={currentValue}
              onChange={handleSelect}
            />

            {/* Navegação */}
            <div className="flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="text-sm text-muted-foreground">
                Selecione uma opção para continuar
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
