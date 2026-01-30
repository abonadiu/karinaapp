import React from "react";
import { Progress } from "@/components/ui/progress";
import { DIMENSIONS } from "@/lib/diagnostic-questions";

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  currentDimension?: string;
}

export function ProgressBar({ 
  currentQuestion, 
  totalQuestions, 
  currentDimension 
}: ProgressBarProps) {
  const progress = ((currentQuestion) / totalQuestions) * 100;
  const dimension = DIMENSIONS.find(d => d.name === currentDimension);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          Pergunta {currentQuestion} de {totalQuestions}
        </span>
        {dimension && (
          <span className="font-medium text-primary">
            {dimension.name}
          </span>
        )}
      </div>
      
      <Progress value={progress} className="h-2" />
      
      {/* Indicadores de dimensões */}
      <div className="flex justify-between mt-1">
        {DIMENSIONS.map((dim, index) => {
          const dimStart = index * 8 + 1;
          const dimEnd = (index + 1) * 8;
          const isActive = currentQuestion >= dimStart && currentQuestion <= dimEnd;
          const isComplete = currentQuestion > dimEnd;
          
          return (
            <div
              key={dim.id}
              className={`flex-1 h-1 mx-0.5 rounded-full transition-colors ${
                isComplete 
                  ? "bg-primary" 
                  : isActive 
                    ? "bg-primary/50" 
                    : "bg-muted"
              }`}
              title={dim.name}
            />
          );
        })}
      </div>
    </div>
  );
}
