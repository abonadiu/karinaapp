import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2, TrendingUp, TrendingDown } from "lucide-react";
import { DiagnosticScores, getWeakestDimensions, getStrongestDimensions } from "@/lib/diagnostic-scoring";
import { RECOMMENDATIONS, getRecommendationsForWeakDimensions } from "@/lib/recommendations";
import { ResultsRadarChart } from "./ResultsRadarChart";
import { DimensionCard } from "./DimensionCard";
import { RecommendationList } from "./RecommendationList";

interface DiagnosticResultsProps {
  participantName: string;
  scores: DiagnosticScores;
  existingResult?: any;
}

export function DiagnosticResults({ participantName, scores, existingResult }: DiagnosticResultsProps) {
  const firstName = participantName.split(" ")[0];
  
  // Se temos resultado existente, reconstruir scores dele
  const displayScores = existingResult ? {
    dimensionScores: Object.entries(existingResult.dimension_scores || {}).map(([dimension, score], index) => ({
      dimension,
      dimensionOrder: index + 1,
      score: score as number,
      maxScore: 5,
      percentage: ((score as number) / 5) * 100
    })),
    totalScore: existingResult.total_score,
    totalPercentage: (existingResult.total_score / 5) * 100
  } : scores;

  const weakDimensions = getWeakestDimensions(displayScores.dimensionScores);
  const strongDimensions = getStrongestDimensions(displayScores.dimensionScores);
  const recommendations = getRecommendationsForWeakDimensions(
    weakDimensions.map(d => d.dimension)
  );

  const getScoreMessage = (score: number) => {
    if (score >= 4) return "Excelente! Você demonstra alto nível de desenvolvimento.";
    if (score >= 3) return "Bom! Há espaço para crescimento em algumas áreas.";
    if (score >= 2) return "Moderado. Recomendamos focar nas práticas sugeridas.";
    return "Em desenvolvimento. Este diagnóstico é o primeiro passo!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit mb-4">
              <Award className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl">
              Parabéns, {firstName}!
            </CardTitle>
            <CardDescription className="text-lg">
              Você completou o Diagnóstico IQ+IS
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-background rounded-full px-6 py-3 shadow-sm">
              <span className="text-muted-foreground">Score Geral:</span>
              <span className="text-3xl font-bold text-primary">
                {displayScores.totalScore.toFixed(1)}
              </span>
              <span className="text-muted-foreground">/5</span>
            </div>
            <p className="text-muted-foreground max-w-md mx-auto">
              {getScoreMessage(displayScores.totalScore)}
            </p>
          </CardContent>
        </Card>

        {/* Gráfico Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral das 5 Dimensões</CardTitle>
            <CardDescription>
              Visualização do seu perfil de inteligência emocional e espiritual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResultsRadarChart scores={displayScores.dimensionScores} />
          </CardContent>
        </Card>

        {/* Pontos Fortes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Seus Pontos Fortes</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {strongDimensions.map(score => (
              <DimensionCard key={score.dimension} score={score} isStrong />
            ))}
          </div>
        </div>

        {/* Áreas de Desenvolvimento */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Áreas de Desenvolvimento</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {weakDimensions.map(score => (
              <DimensionCard key={score.dimension} score={score} isWeak />
            ))}
          </div>
        </div>

        {/* Todas as Dimensões */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Dimensão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayScores.dimensionScores.map(score => (
              <DimensionCard 
                key={score.dimension} 
                score={score}
                isWeak={weakDimensions.some(w => w.dimension === score.dimension)}
                isStrong={strongDimensions.some(s => s.dimension === score.dimension)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Recomendações */}
        <RecommendationList recommendations={recommendations} />

        {/* Ações */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" className="gap-2" disabled>
                <Download className="h-4 w-4" />
                Baixar PDF (em breve)
              </Button>
              <Button variant="outline" className="gap-2" disabled>
                <Share2 className="h-4 w-4" />
                Compartilhar (em breve)
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Guarde este link para acessar seus resultados novamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
