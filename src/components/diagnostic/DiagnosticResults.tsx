import React, { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { DiagnosticScores, getWeakestDimensions, getStrongestDimensions } from "@/lib/diagnostic-scoring";
import { getRecommendationsForWeakDimensions } from "@/lib/recommendations";
import { generateDiagnosticPDF } from "@/lib/pdf-generator";
import { ResultsRadarChart } from "./ResultsRadarChart";
import { DimensionCard } from "./DimensionCard";
import { RecommendationList } from "./RecommendationList";
import { ScheduleFeedbackCard } from "./ScheduleFeedbackCard";
import { CreateAccountCTA } from "./CreateAccountCTA";
import { toast } from "sonner";
import { FacilitatorProfile } from "@/hooks/useDiagnostic";

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
        {/* Logo do facilitador no topo dos resultados */}
        {facilitatorProfile?.logo_url && (
          <div className="flex justify-center">
            <img 
              src={facilitatorProfile.logo_url} 
              alt="Logo do facilitador" 
              className="h-12 w-auto object-contain"
            />
          </div>
        )}

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

        {/* CTA para criar conta - só aparece se não tem resultado existente (diagnóstico foi feito agora) */}
        {!existingResult && participantEmail && accessToken && (
          <div className="pdf-hide">
            <CreateAccountCTA
              participantEmail={participantEmail}
              participantName={participantName}
              accessToken={accessToken}
            />
          </div>
        )}

        {/* Agendamento de Sessão de Feedback */}
        {facilitatorProfile?.calendly_url && (
          <div className="pdf-hide">
            <ScheduleFeedbackCard 
              calendlyUrl={facilitatorProfile.calendly_url}
              participantName={participantName}
            />
          </div>
        )}

        {/* Ações */}
        <Card className="pdf-hide">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
                {isGeneratingPDF ? "Gerando PDF..." : "Baixar PDF"}
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
