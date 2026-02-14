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
          <div key={index} className={cn("rounded-lg border overflow-hidden shadow-warm-sm", colors.border, "border-l-4")}>
            {/* Header */}
            <div className={cn("px-4 py-3 flex items-center gap-3", colors.bgSubtle)}>
              <div className={cn("p-1.5 rounded-md", colors.bg, "bg-opacity-20")}>
                <DimIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{rec.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{rec.description}</p>
              </div>
            </div>

            {/* Practices */}
            <div className="p-4 space-y-2.5">
              {rec.practices.map((practice, pIndex) => (
                <div key={pIndex} className="flex items-start gap-3 text-sm">
                  <div className={cn("flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", colors.bgSubtle, colors.text)}>
                    {pIndex + 1}
                  </div>
                  <span className="text-foreground/90 leading-relaxed text-xs">{practice}</span>
                </div>
              ))}
            </div>

            {/* Resources & Benefits */}
            {(rec.resources?.length > 0 || rec.expectedBenefits) && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                {rec.resources?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold">Recursos Recomendados</span>
                    </div>
                    <ul className="space-y-1">
                      {rec.resources.map((r, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <Star className="h-3 w-3 flex-shrink-0 mt-0.5 text-accent" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {rec.expectedBenefits && (
                  <div className="rounded-md bg-primary/5 p-3 flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground/80 leading-relaxed">
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
