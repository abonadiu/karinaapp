import React from "react";
import { Recommendation } from "@/lib/recommendations";
import { getDimensionColor } from "@/lib/dimension-descriptions";
import { Target, Flame, Calendar, BookOpen, Heart, Compass, Brain, Sparkles, Users, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationListProps {
  recommendations: Recommendation[];
}

const DIMENSION_ICONS: Record<string, LucideIcon> = {
  "Consciência Interior": Brain,
  "Coerência Emocional": Heart,
  "Conexão e Propósito": Compass,
  "Relações e Compaixão": Users,
  "Transformação": Sparkles
};

// Extract dimension name from recommendation title
function getDimensionFromTitle(title: string): string {
  if (title.includes("Consciência")) return "Consciência Interior";
  if (title.includes("Coerência")) return "Coerência Emocional";
  if (title.includes("Conexão") || title.includes("Propósito")) return "Conexão e Propósito";
  if (title.includes("Relações") || title.includes("Compaixão")) return "Relações e Compaixão";
  if (title.includes("Transformação")) return "Transformação";
  return "";
}

const PRACTICE_ICONS: LucideIcon[] = [Flame, BookOpen, Calendar, Target];

export function RecommendationList({ recommendations }: RecommendationListProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Recomendações para Você</h3>
      </div>

      {recommendations.map((rec, index) => {
        const dimension = getDimensionFromTitle(rec.title);
        const colors = getDimensionColor(dimension);
        const DimIcon = DIMENSION_ICONS[dimension] || Target;

        return (
          <div key={index} className={cn(
            "rounded-lg border overflow-hidden shadow-warm-sm",
            colors.border,
            "border-l-4"
          )}>
            {/* Header with gradient */}
            <div className={cn("px-4 py-3 flex items-center gap-3", colors.bgSubtle)}>
              <div className={cn("p-1.5 rounded-md", colors.bg, "bg-opacity-20")}>
                <DimIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{rec.title}</h4>
                <p className="text-xs text-muted-foreground">{rec.description}</p>
              </div>
            </div>

            {/* Practices with numbered steps */}
            <div className="p-4 space-y-2.5">
              {rec.practices.map((practice, pIndex) => {
                const PracticeIcon = PRACTICE_ICONS[pIndex % PRACTICE_ICONS.length];
                return (
                  <div key={pIndex} className="flex items-start gap-3 text-sm">
                    <div className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                      colors.bgSubtle, colors.text
                    )}>
                      {pIndex + 1}
                    </div>
                    <span className="text-foreground/90 leading-relaxed">{practice}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
