import React from "react";
import { getCrossAnalysisInsights, CrossInsight } from "@/lib/cross-analysis";
import { DimensionScore } from "@/lib/diagnostic-scoring";
import { getDimensionColor } from "@/lib/dimension-descriptions";
import { GitBranch, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrossAnalysisProps {
  dimensionScores: DimensionScore[];
}

export function CrossAnalysis({ dimensionScores }: CrossAnalysisProps) {
  const insights = getCrossAnalysisInsights(dimensionScores);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Análise Cruzada entre Dimensões</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        A interação entre suas dimensões revela padrões únicos que complementam a análise individual. Os insights abaixo identificam dinâmicas específicas do seu perfil.
      </p>

      {insights.map((insight, index) => {
        const color1 = getDimensionColor(insight.dimensions[0]);
        const color2 = getDimensionColor(insight.dimensions[1]);

        return (
          <div key={index} className="rounded-lg border border-border overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-muted/30 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className={cn("w-2.5 h-2.5 rounded-full", color1.bg)} />
                <span className="text-xs font-medium">{insight.dimensions[0]}</span>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <div className="flex items-center gap-1.5">
                <span className={cn("w-2.5 h-2.5 rounded-full", color2.bg)} />
                <span className="text-xs font-medium">{insight.dimensions[1]}</span>
              </div>
              <span className="ml-auto text-xs font-semibold text-foreground/70">{insight.title}</span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-foreground/85 leading-relaxed">
                {insight.insight}
              </p>
              <div className="rounded-md bg-primary/5 p-3">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  <strong className="text-primary">Recomendação:</strong> {insight.recommendation}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
