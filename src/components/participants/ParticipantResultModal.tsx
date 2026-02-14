import { useRef, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Download, Loader2, Award, BookOpen, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ResultsRadarChart } from "@/components/diagnostic/ResultsRadarChart";
import { DimensionCard } from "@/components/diagnostic/DimensionCard";
import { RecommendationList } from "@/components/diagnostic/RecommendationList";
import { ExecutiveSummary } from "@/components/diagnostic/ExecutiveSummary";
import { CrossAnalysis } from "@/components/diagnostic/CrossAnalysis";
import { ActionPlan } from "@/components/diagnostic/ActionPlan";
import {
  DimensionScore,
  getStrongestDimensions,
  getWeakestDimensions,
} from "@/lib/diagnostic-scoring";
import { getRecommendationsForWeakDimensions } from "@/lib/recommendations";
import { generateParticipantPDF } from "@/lib/pdf-generator";
import { toast } from "sonner";
import { DIAGNOSTIC_INTRO, DIAGNOSTIC_THEORETICAL_FOUNDATION, getOverallScoreMessage, getScoreLevelBadge } from "@/lib/dimension-descriptions";

interface ParticipantResultModalProps {
  participantName: string;
  completedAt: string;
  totalScore: number;
  dimensionScores: DimensionScore[];
}

export function ParticipantResultModal({
  participantName,
  completedAt,
  totalScore,
  dimensionScores,
}: ParticipantResultModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const strongest = getStrongestDimensions(dimensionScores);
  const weakest = getWeakestDimensions(dimensionScores);
  const weakDimensionNames = weakest.map((d) => d.dimension);
  const recommendations = getRecommendationsForWeakDimensions(weakDimensionNames);

  const strongSet = new Set(strongest.map((d) => d.dimension));
  const weakSet = new Set(weakest.map((d) => d.dimension));

  const formattedDate = format(new Date(completedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const scoreBadge = getScoreLevelBadge(totalScore);
  const percentage = (totalScore / 5) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsGeneratingPDF(true);
    try {
      await generateParticipantPDF(contentRef.current, participantName, totalScore, dimensionScores, completedAt);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const firstName = participantName.split(" ")[0];

  return (
    <div className="space-y-6" ref={contentRef}>
      {/* 1. Score Header */}
      <div className="rounded-xl gradient-warm-subtle p-6 space-y-4">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
              <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
              <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{totalScore.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground">/5</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-semibold text-foreground">Resultado de {firstName}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="h-3.5 w-3.5" />Concluído em {formattedDate}
            </p>
            <Badge variant="secondary" className={`mt-2 text-xs ${scoreBadge.className}`}>{scoreBadge.label}</Badge>
          </div>
        </div>
        <p className="text-sm text-foreground/80 italic leading-relaxed">"{getOverallScoreMessage(totalScore)}"</p>
      </div>

      {/* 2. Resumo Executivo */}
      <ExecutiveSummary participantName={participantName} totalScore={totalScore} dimensionScores={dimensionScores} />

      {/* 3. Sobre o Diagnóstico */}
      <div className="rounded-xl border border-border p-5 space-y-2">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-1">Sobre o Diagnóstico IQ+IS</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{DIAGNOSTIC_INTRO}</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed pl-14">{DIAGNOSTIC_THEORETICAL_FOUNDATION}</p>
      </div>

      <Separator />

      {/* 4. Radar Chart */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />Visão Geral das 5 Dimensões
        </h4>
        <ResultsRadarChart scores={dimensionScores} />
      </div>

      <Separator />

      {/* 5. Análise Dimensional Detalhada */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-2">
          <Award className="h-4 w-4" />Análise Dimensional Detalhada
        </h4>
        <p className="text-xs text-muted-foreground mb-3">Clique em cada dimensão para explorar a análise completa.</p>
        <div className="space-y-2">
          {dimensionScores.map((s) => (
            <DimensionCard key={s.dimension} score={s} isStrong={strongSet.has(s.dimension)} isWeak={weakSet.has(s.dimension)} />
          ))}
        </div>
      </div>

      {/* 6. Análise Cruzada */}
      <Separator />
      <CrossAnalysis dimensionScores={dimensionScores} />

      {/* 7. Recomendações */}
      {recommendations.length > 0 && (
        <>
          <Separator />
          <RecommendationList recommendations={recommendations} />
        </>
      )}

      {/* 8. Plano de Ação */}
      <Separator />
      <ActionPlan dimensionScores={dimensionScores} />

      {/* 9. Download PDF */}
      <div className="flex justify-center pt-2 pdf-hide">
        <Button variant="outline" className="gap-2" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
          {isGeneratingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isGeneratingPDF ? "Gerando..." : "Baixar PDF"}
        </Button>
      </div>
    </div>
  );
}
