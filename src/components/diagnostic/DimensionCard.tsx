import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DimensionScore, getScoreLevel } from "@/lib/diagnostic-scoring";
import { getDimensionAbout, getInterpretation, getDimensionWhyItMatters } from "@/lib/dimension-descriptions";
import { Brain, Heart, Compass, Users, Sparkles, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DimensionCardProps {
  score: DimensionScore;
  isWeak?: boolean;
  isStrong?: boolean;
}

const ICONS: Record<string, LucideIcon> = {
  "Consciência Interior": Brain,
  "Coerência Emocional": Heart,
  "Conexão e Propósito": Compass,
  "Relações e Compaixão": Users,
  "Transformação": Sparkles
};

export function DimensionCard({ score, isWeak, isStrong }: DimensionCardProps) {
  const Icon = ICONS[score.dimension] || Brain;
  const level = getScoreLevel(score.score);
  const about = getDimensionAbout(score.dimension);
  const interpretation = getInterpretation(score.dimension, score.score);
  const whyItMatters = getDimensionWhyItMatters(score.dimension);

  return (
    <Card className={cn(
      "transition-all",
      isWeak && "border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20",
      isStrong && "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isWeak && "bg-orange-100 dark:bg-orange-900/30",
              isStrong && "bg-green-100 dark:bg-green-900/30",
              !isWeak && !isStrong && "bg-primary/10"
            )}>
              <Icon className={cn(
                "h-5 w-5",
                isWeak && "text-orange-600",
                isStrong && "text-green-600",
                !isWeak && !isStrong && "text-primary"
              )} />
            </div>
            <div>
              <CardTitle className="text-base">{score.dimension}</CardTitle>
              {isWeak && (
                <span className="text-xs text-orange-600 font-medium">
                  Área de desenvolvimento
                </span>
              )}
              {isStrong && (
                <span className="text-xs text-green-600 font-medium">
                  Ponto forte
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{score.score.toFixed(1)}</span>
            <span className="text-muted-foreground">/5</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <Progress 
          value={score.percentage} 
          className={cn(
            "h-2",
            isWeak && "[&>div]:bg-orange-500",
            isStrong && "[&>div]:bg-green-500"
          )}
        />
        
        <p className="text-sm text-muted-foreground">
          {about}
        </p>

        {interpretation && (
          <p className="text-sm italic text-foreground/80 border-l-2 border-primary/30 pl-3">
            {interpretation}
          </p>
        )}

        {whyItMatters && (
          <p className="text-xs text-muted-foreground/70">
            💡 {whyItMatters}
          </p>
        )}
        
        <div className={cn("text-sm font-medium", level.color)}>
          {level.label}
        </div>
      </CardContent>
    </Card>
  );
}
