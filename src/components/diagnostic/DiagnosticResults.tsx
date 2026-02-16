import React, { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Share2, Loader2, BookOpen, Calendar, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { DiagnosticScores, getWeakestDimensions, getStrongestDimensions } from "@/lib/diagnostic-scoring";
import { getRecommendationsForWeakDimensions } from "@/lib/recommendations";
import { generateDiagnosticPDF } from "@/lib/pdf-generator";
import { DIAGNOSTIC_INTRO, DIAGNOSTIC_THEORETICAL_FOUNDATION, getOverallScoreMessage, getScoreLevelBadge } from "@/lib/dimension-descriptions";
import { normalizeDimensionScores } from "@/lib/dimension-utils";
import { ResultsRadarChart } from "./ResultsRadarChart";
import { DimensionCard } from "./DimensionCard";
import { RecommendationList } from "./RecommendationList";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { CrossAnalysis } from "./CrossAnalysis";
import { ActionPlan } from "./ActionPlan";
import { ScheduleFeedbackCard } from "./ScheduleFeedbackCard";
import { CreateAccountCTA } from "./CreateAccountCTA";
import { toast } from "sonner";
import { FacilitatorProfile } from "@/hooks/useDiagnostic";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface DiagnosticResultsProps {
  participantName: string;
  participantEmail?: string;
  accessToken?: string;
  scores: DiagnosticScores;
  existingResult?: any;
  facilitatorProfile?: FacilitatorProfile | null;
}

export function DiagnosticResults({ participantName, participantEmail, accessToken, scores, existingResult, facilitatorProfile }: DiagnosticResultsProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const firstName = participantName.split(" ")[0];
  
  // Build raw scores from existingResult or live scores
  const rawScores = existingResult ? {
    dimensionScores: Object.entries(existingResult.dimension_scores || {}).map(([dimension, scoreVal], index) => {
      const score = typeof scoreVal === 'number' ? scoreVal : (scoreVal as any)?.score ?? 0;
      return {
        dimension,
        dimensionOrder: index + 1,
        score,
        maxScore: 5,
        percentage: (score / 5) * 100
      };
    }),
    totalScore: existingResult.total_score,
    totalPercentage: (existingResult.total_score / 5) * 100
  } : scores;

  // Normalize dimension names (slug → formatted) so all child components work correctly
  const displayScores = {
    ...rawScores,
    dimensionScores: normalizeDimensionScores(rawScores.dimensionScores),
  };

  const weakDimensions = getWeakestDimensions(displayScores.dimensionScores);
  const strongDimensions = getStrongestDimensions(displayScores.dimensionScores);
  const recommendations = getRecommendationsForWeakDimensions(weakDimensions.map(d => d.dimension));

  const strongSet = new Set(strongDimensions.map(d => d.dimension));
  const weakSet = new Set(weakDimensions.map(d => d.dimension));

  const scoreBadge = getScoreLevelBadge(displayScores.totalScore);
  const percentage = (displayScores.totalScore / 5) * 100;
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const completedDate = existingResult?.completed_at 
    ? format(new Date(existingResult.completed_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsGeneratingPDF(true);
    try {
      await generateDiagnosticPDF(contentRef.current, {
        participantName,
        totalScore: displayScores.totalScore,
        dimensionScores: displayScores.dimensionScores,
        recommendations,
        completedAt: existingResult?.completed_at,
        facilitatorProfile: facilitatorProfile || undefined
      });
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-8 px-4">
      <div ref={contentRef} className="max-w-4xl mx-auto space-y-8">
        {/* Facilitator logo */}
        {facilitatorProfile?.logo_url && (
          <div className="flex justify-center">
            <img src={facilitatorProfile.logo_url} alt="Logo do facilitador" className="h-12 w-auto object-contain" />
          </div>
        )}

        {/* 1. Score Header */}
        <div className="rounded-xl gradient-warm-subtle p-8 space-y-5">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
              <svg width="110" height="110" viewBox="0 0 110 110" className="transform -rotate-90">
                <circle cx="55" cy="55" r="44" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
                <circle cx="55" cy="55" r="44" fill="none" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{displayScores.totalScore.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/5</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="font-display text-2xl font-semibold text-foreground">Resultado de {firstName}</h1>
              <p className="text-base text-muted-foreground mt-1">Diagnóstico de Consciência Integral</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-2 justify-center sm:justify-start">
                <Calendar className="h-3.5 w-3.5" />Concluído em {completedDate}
              </p>
              <Badge variant="secondary" className={`mt-2 text-sm ${scoreBadge.className}`}>{scoreBadge.label}</Badge>
            </div>
          </div>
          <p className="text-base text-foreground/80 italic leading-relaxed max-w-2xl">"{getOverallScoreMessage(displayScores.totalScore)}"</p>
        </div>

        {/* 2. Resumo Executivo with Strengths/Development boxes */}
        <div className="space-y-4">
          <ExecutiveSummary participantName={participantName} totalScore={displayScores.totalScore} dimensionScores={displayScores.dimensionScores} />

          {/* Pontos Fortes / Áreas de Desenvolvimento - side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-sm text-green-700 dark:text-green-400">Pontos Fortes</h4>
              </div>
              {strongDimensions.map((dim) => (
                <div key={dim.dimension} className="flex items-center justify-between text-sm">
                  <span className="text-green-800 dark:text-green-300">{dim.dimension}</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">{dim.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h4 className="font-semibold text-sm text-amber-700 dark:text-amber-400">Áreas de Desenvolvimento</h4>
              </div>
              {weakDimensions.map((dim) => (
                <div key={dim.dimension} className="flex items-center justify-between text-sm">
                  <span className="text-amber-800 dark:text-amber-300">{dim.dimension}</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-400">{dim.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Sobre o Diagnóstico */}
        <div className="rounded-xl border border-border p-6 space-y-3">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold mb-1">Sobre o Diagnóstico de Consciência Integral</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{DIAGNOSTIC_INTRO}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-16">{DIAGNOSTIC_THEORETICAL_FOUNDATION}</p>
        </div>

        {/* 4. Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Visão Geral das 5 Dimensões</CardTitle>
            <CardDescription>Visualização do seu perfil de inteligência emocional e espiritual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResultsRadarChart scores={displayScores.dimensionScores} />
          </CardContent>
        </Card>

        {/* 5. Análise Dimensional Detalhada */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Análise Dimensional Detalhada</h3>
          </div>
          <p className="text-base text-muted-foreground">Clique em cada dimensão para explorar a análise completa com fundamentação teórica, subdimensões e interpretação personalizada.</p>
          {displayScores.dimensionScores.map(score => (
            <DimensionCard key={score.dimension} score={score} isWeak={weakSet.has(score.dimension)} isStrong={strongSet.has(score.dimension)} />
          ))}
        </div>

        <Separator />

        {/* 6. Análise Cruzada */}
        <CrossAnalysis dimensionScores={displayScores.dimensionScores} />

        <Separator />

        {/* 7. Recomendações */}
        <RecommendationList recommendations={recommendations} />

        <Separator />

        {/* 8. Plano de Ação */}
        <ActionPlan dimensionScores={displayScores.dimensionScores} />

        {/* CTA para criar conta */}
        {!existingResult && participantEmail && accessToken && (
          <div className="pdf-hide"><CreateAccountCTA participantEmail={participantEmail} participantName={participantName} accessToken={accessToken} /></div>
        )}

        {/* Agendamento */}
        {facilitatorProfile?.calendly_url && (
          <div className="pdf-hide"><ScheduleFeedbackCard calendlyUrl={facilitatorProfile.calendly_url} participantName={participantName} /></div>
        )}

        {/* 9. Actions */}
        <Card className="pdf-hide">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" className="gap-2" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                {isGeneratingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isGeneratingPDF ? "Gerando PDF..." : "Baixar PDF"}
              </Button>
              <Button variant="outline" className="gap-2" disabled><Share2 className="h-4 w-4" />Compartilhar (em breve)</Button>
            </div>
            <p className="text-center text-base text-muted-foreground mt-4">Guarde este link para acessar seus resultados novamente.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
