import { useRef, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Download, Loader2, TrendingUp, TrendingDown, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ResultsRadarChart } from "@/components/diagnostic/ResultsRadarChart";
import { DimensionCard } from "@/components/diagnostic/DimensionCard";
import { RecommendationList } from "@/components/diagnostic/RecommendationList";
import {
  DimensionScore,
  getScoreLevel,
  getStrongestDimensions,
  getWeakestDimensions,
} from "@/lib/diagnostic-scoring";
import { getRecommendationsForWeakDimensions } from "@/lib/recommendations";
import { generateParticipantPDF } from "@/lib/pdf-generator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  const level = getScoreLevel(totalScore);
  const strongest = getStrongestDimensions(dimensionScores);
  const weakest = getWeakestDimensions(dimensionScores);
  const weakDimensionNames = weakest.map((d) => d.dimension);
  const recommendations = getRecommendationsForWeakDimensions(weakDimensionNames);

  const strongSet = new Set(strongest.map((d) => d.dimension));
  const weakSet = new Set(weakest.map((d) => d.dimension));

  const formattedDate = format(new Date(completedAt), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsGeneratingPDF(true);
    try {
      await generateParticipantPDF(
        contentRef.current,
        participantName,
        totalScore,
        dimensionScores,
        completedAt
      );
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6" ref={contentRef}>
      {/* Score Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Concluído em {formattedDate}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{totalScore.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground block">/5</span>
              </div>
            </div>
          </div>
          <div className="text-left">
            <p className={cn("text-sm font-semibold", level.color)}>{level.label}</p>
            <p className="text-xs text-muted-foreground">Score geral do diagnóstico</p>
          </div>
        </div>

        <Progress value={(totalScore / 5) * 100} className="h-2 max-w-xs mt-1" />
      </div>

      <Separator />

      {/* Radar Chart */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
          <Award className="h-4 w-4" />
          Visão Geral
        </h4>
        <ResultsRadarChart scores={dimensionScores} />
      </div>

      <Separator />

      {/* Strengths & Weaknesses Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2 text-green-600">
            <TrendingUp className="h-4 w-4" />
            Pontos Fortes
          </h4>
          {strongest.map((s) => (
            <DimensionCard key={s.dimension} score={s} isStrong />
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2 text-orange-500">
            <TrendingDown className="h-4 w-4" />
            Áreas de Desenvolvimento
          </h4>
          {weakest.map((s) => (
            <DimensionCard key={s.dimension} score={s} isWeak />
          ))}
        </div>
      </div>

      <Separator />

      {/* All Dimensions Detail */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">
          Detalhamento por Dimensão
        </h4>
        <div className="space-y-3">
          {dimensionScores.map((s) => (
            <DimensionCard
              key={s.dimension}
              score={s}
              isStrong={strongSet.has(s.dimension)}
              isWeak={weakSet.has(s.dimension)}
            />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <>
          <Separator />
          <RecommendationList recommendations={recommendations} />
        </>
      )}

      {/* Download PDF */}
      <div className="flex justify-center pt-2 pdf-hide">
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isGeneratingPDF ? "Gerando..." : "Baixar PDF"}
        </Button>
      </div>
    </div>
  );
}
