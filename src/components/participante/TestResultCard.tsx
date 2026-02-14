import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ResultsRadarChart } from "@/components/diagnostic/ResultsRadarChart";
import { DimensionCard } from "@/components/diagnostic/DimensionCard";
import { RecommendationList } from "@/components/diagnostic/RecommendationList";
import { getWeakestDimensions, getStrongestDimensions } from "@/lib/diagnostic-scoring";
import { getRecommendationsForWeakDimensions } from "@/lib/recommendations";
import {
  Brain, Target, Heart, ChevronDown, ChevronUp, Award,
  Calendar, Clock, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Download, Loader2,
} from "lucide-react";
import { generateDiagnosticPDF } from "@/lib/pdf-generator";
import { toast } from "sonner";

export interface TestData {
  id: string;
  test_name: string;
  test_slug: string;
  test_icon: string;
  status: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  result: {
    id: string;
    total_score: number;
    dimension_scores: Record<string, { score: number }>;
    completed_at: string;
  } | null;
}

interface TestResultCardProps {
  test: TestData;
  participantName: string;
  facilitatorLogoUrl?: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  brain: Brain,
  target: Target,
  heart: Heart,
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ElementType }> = {
  completed: { label: "Concluído", variant: "default", icon: CheckCircle2 },
  in_progress: { label: "Em andamento", variant: "secondary", icon: Clock },
  pending: { label: "Pendente", variant: "outline", icon: AlertCircle },
  invited: { label: "Convidado", variant: "outline", icon: AlertCircle },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export function TestResultCard({ test, participantName, facilitatorLogoUrl }: TestResultCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const IconComponent = iconMap[test.test_icon] || Brain;
  const status = statusConfig[test.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isCompleted = test.status === "completed" && test.result;

  const dimensionScores = test.result
    ? Object.entries(test.result.dimension_scores).map(([dimension, data], index) => ({
        dimension,
        dimensionOrder: index + 1,
        score: data.score,
        maxScore: 5,
        percentage: (data.score / 5) * 100,
      }))
    : [];

  const weakDimensions = isCompleted ? getWeakestDimensions(dimensionScores) : [];
  const strongDimensions = isCompleted ? getStrongestDimensions(dimensionScores) : [];
  const recommendations = isCompleted
    ? getRecommendationsForWeakDimensions(weakDimensions.map((d) => d.dimension))
    : [];

  const handleDownloadPDF = async () => {
    if (!contentRef.current || !test.result) return;
    setIsGeneratingPDF(true);
    try {
      await generateDiagnosticPDF(contentRef.current, {
        participantName,
        totalScore: test.result.total_score,
        dimensionScores,
        recommendations,
        completedAt: test.result.completed_at,
        facilitatorProfile: facilitatorLogoUrl ? { logo_url: facilitatorLogoUrl } : undefined,
      });
      toast.success("PDF gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={isCompleted ? "border-primary/20" : ""}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${isCompleted ? "bg-primary/10" : "bg-muted"}`}>
                  <IconComponent className={`h-5 w-5 ${isCompleted ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{test.test_name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant={status.variant} className="gap-1 text-xs">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                    {isCompleted && test.result && (
                      <span className="text-sm font-medium text-primary">
                        Score: {test.result.total_score.toFixed(1)}/5
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs text-muted-foreground hidden sm:block">
                  {test.completed_at ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      Concluído em {formatDate(test.completed_at)}
                    </div>
                  ) : test.started_at ? (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Iniciado em {formatDate(test.started_at)}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Atribuído em {formatDate(test.created_at)}
                    </div>
                  )}
                </div>
                {isCompleted && (
                  isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
            {/* Mobile date */}
            <div className="sm:hidden text-xs text-muted-foreground mt-2">
              {test.completed_at
                ? `Concluído em ${formatDate(test.completed_at)}`
                : test.started_at
                ? `Iniciado em ${formatDate(test.started_at)}`
                : `Atribuído em ${formatDate(test.created_at)}`}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        {!isCompleted && (
          <CardContent className="pt-0">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              {test.status === "in_progress" ? (
                <p>Este teste está em andamento. Continue de onde parou acessando o link enviado por e-mail.</p>
              ) : (
                <p>Este teste ainda não foi iniciado. Verifique seu e-mail para acessar o link de acesso.</p>
              )}
            </div>
          </CardContent>
        )}

        {isCompleted && test.result && (
          <CollapsibleContent>
            <CardContent ref={contentRef} className="pt-0 space-y-6">
              {/* Score highlight */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="h-6 w-6 text-primary" />
                  <span className="text-sm text-muted-foreground">Score Geral</span>
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary">{test.result.total_score.toFixed(1)}</span>
                  <span className="text-lg text-muted-foreground">/5</span>
                </div>
              </div>

              {/* Radar Chart */}
              <div>
                <h4 className="font-semibold mb-3">Visão Geral das Dimensões</h4>
                <ResultsRadarChart scores={dimensionScores} />
              </div>

              {/* Strong Points */}
              {strongDimensions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Pontos Fortes</h4>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {strongDimensions.map((s) => (
                      <DimensionCard key={s.dimension} score={s} isStrong />
                    ))}
                  </div>
                </div>
              )}

              {/* Weak Points */}
              {weakDimensions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <h4 className="font-semibold text-sm">Áreas de Desenvolvimento</h4>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {weakDimensions.map((s) => (
                      <DimensionCard key={s.dimension} score={s} isWeak />
                    ))}
                  </div>
                </div>
              )}

              {/* All dimensions */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Detalhamento por Dimensão</h4>
                {dimensionScores.map((s) => (
                  <DimensionCard
                    key={s.dimension}
                    score={s}
                    isWeak={weakDimensions.some((w) => w.dimension === s.dimension)}
                    isStrong={strongDimensions.some((st) => st.dimension === s.dimension)}
                  />
                ))}
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 && <RecommendationList recommendations={recommendations} />}

              {/* Download PDF */}
              <div className="flex justify-center pdf-hide">
                <Button variant="outline" className="gap-2" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                  {isGeneratingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isGeneratingPDF ? "Gerando PDF..." : "Baixar PDF"}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        )}
      </Card>
    </Collapsible>
  );
}
