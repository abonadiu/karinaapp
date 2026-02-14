import { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ResultsRadarChart } from "@/components/diagnostic/ResultsRadarChart";
import { DimensionScore, getStrongestDimensions, getWeakestDimensions } from "@/lib/diagnostic-scoring";
import { generateParticipantPDF } from "@/lib/pdf-generator";
import { normalizeDimensionScores } from "@/lib/dimension-utils";
import { ChevronDown, ChevronUp, Calendar, TrendingUp, TrendingDown, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ParticipantResultCardProps {
  participantName: string;
  completedAt: string;
  totalScore: number;
  dimensionScores: DimensionScore[];
}

export function ParticipantResultCard({
  participantName,
  completedAt,
  totalScore,
  dimensionScores: rawDimensionScores
}: ParticipantResultCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const cardContentRef = useRef<HTMLDivElement>(null);

  // Normalize dimension names (slug → formatted)
  const dimensionScores = normalizeDimensionScores(rawDimensionScores);

  const strongest = getStrongestDimensions(dimensionScores);
  const weakest = getWeakestDimensions(dimensionScores);

  const formattedDate = new Date(completedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion toggle
    
    if (!cardContentRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      await generateParticipantPDF(
        cardContentRef.current,
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        "transition-all shadow-warm",
        isOpen && "ring-2 ring-primary/20"
      )}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {participantName}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Concluído em {formattedDate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{totalScore.toFixed(1)}</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {/* PDF capture area */}
            <div ref={cardContentRef} className="space-y-6">
              {/* Header for PDF */}
              <div className="pdf-only hidden">
                <h2 className="text-xl font-bold text-center">{participantName}</h2>
                <p className="text-center text-muted-foreground">Score: {totalScore.toFixed(1)}/5</p>
              </div>

              {/* Radar chart */}
              <ResultsRadarChart scores={dimensionScores} />

              {/* Strengths and development areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2 text-success">
                    <TrendingUp className="h-4 w-4" />
                    Pontos Fortes
                  </h4>
                  <ul className="space-y-1">
                    {strongest.map((score) => (
                      <li key={score.dimension} className="text-sm flex items-center justify-between bg-success/10 rounded-md px-3 py-2">
                        <span>{score.dimension}</span>
                        <span className="font-semibold text-success">{score.score.toFixed(1)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2 text-orange-500">
                    <TrendingDown className="h-4 w-4" />
                    Áreas de Desenvolvimento
                  </h4>
                  <ul className="space-y-1">
                    {weakest.map((score) => (
                      <li key={score.dimension} className="text-sm flex items-center justify-between bg-orange-500/10 rounded-md px-3 py-2">
                        <span>{score.dimension}</span>
                        <span className="font-semibold text-orange-500">{score.score.toFixed(1)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Download button */}
            <div className="flex justify-center pt-2 pdf-hide">
              <Button
                variant="outline"
                size="sm"
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
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
