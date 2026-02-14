import React from "react";
import { Recommendation } from "@/lib/recommendations";
import { getDimensionColor } from "@/lib/dimension-descriptions";
import { Target, Flame, Calendar, BookOpen, Heart, Compass, Brain, Sparkles, Users, LucideIcon, Star, CheckCircle } from "lucide-react";
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

function getDimensionFromTitle(title: string): string {
  if (title.includes("Consciência")) return "Consciência Interior";
  if (title.includes("Coerência")) return "Coerência Emocional";
  if (title.includes("Conexão") || title.includes("Propósito")) return "Conexão e Propósito";
  if (title.includes("Relações") || title.includes("Compaixão")) return "Relações e Compaixão";
  if (title.includes("Transformação")) return "Transformação";
  return "";
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Recomendações para Você</h3>
      </div>

      {recommendations.map((rec, index) => {
        const dimension = getDimensionFromTitle(rec.title);
        const colors = getDimensionColor(dimension);
        const DimIcon = DIMENSION_ICONS[dimension] || Target;

        return (
          <div key={index} className={cn("rounded-xl border overflow-hidden shadow-warm-sm", colors.border, "border-l-4")}>
            {/* Header */}
            <div className={cn("px-5 py-4 flex items-center gap-3", colors.bgSubtle)}>
              <div className={cn("p-2 rounded-lg", colors.bg, "bg-opacity-20")}>
                <DimIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base">{rec.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{rec.description}</p>
              </div>
            </div>

            {/* Practices */}
            <div className="p-5 space-y-3">
              {rec.practices.map((practice, pIndex) => (
                <div key={pIndex} className="flex items-start gap-3">
                  <div className={cn("flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", colors.bgSubtle, colors.text)}>
                    {pIndex + 1}
                  </div>
                  <span className="text-foreground/90 leading-relaxed text-sm">{practice}</span>
                </div>
              ))}
            </div>

            {/* Resources & Benefits */}
            {(rec.resources?.length > 0 || rec.expectedBenefits) && (
              <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                {rec.resources?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Recursos Recomendados</span>
                    </div>
                    <ul className="space-y-1.5">
                      {rec.resources.map((r, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Star className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-accent" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {rec.expectedBenefits && (
                  <div className="rounded-lg bg-primary/5 p-4 flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      <strong>Resultados esperados:</strong> {rec.expectedBenefits}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
