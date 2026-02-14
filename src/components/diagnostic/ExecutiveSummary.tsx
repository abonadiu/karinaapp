import React from "react";
import { generateExecutiveSummary } from "@/lib/executive-summary";
import { DimensionScore } from "@/lib/diagnostic-scoring";
import { FileText } from "lucide-react";

interface ExecutiveSummaryProps {
  participantName: string;
  totalScore: number;
  dimensionScores: DimensionScore[];
}

export function ExecutiveSummary({ participantName, totalScore, dimensionScores }: ExecutiveSummaryProps) {
  const summary = generateExecutiveSummary({ participantName, totalScore, dimensionScores });

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-display text-base font-semibold">Resumo Executivo</h3>
      </div>
      <p className="text-sm text-foreground/85 leading-relaxed">
        {summary}
      </p>
    </div>
  );
}
