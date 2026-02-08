import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { supabase } from "@/integrations/backend/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LogOut, Award, TrendingUp, TrendingDown, Download, Building2 } from "lucide-react";
import { ResultsRadarChart } from "@/components/diagnostic/ResultsRadarChart";
import { DimensionCard } from "@/components/diagnostic/DimensionCard";
import { RecommendationList } from "@/components/diagnostic/RecommendationList";
import { ScheduleFeedbackCard } from "@/components/diagnostic/ScheduleFeedbackCard";
import { getWeakestDimensions, getStrongestDimensions } from "@/lib/diagnostic-scoring";
import { getRecommendationsForWeakDimensions } from "@/lib/recommendations";
import { generateDiagnosticPDF } from "@/lib/pdf-generator";

interface PortalData {
  participant: {
    id: string;
    name: string;
    email: string;
    company_name: string;
    status: string;
    completed_at: string | null;
  };
  result: {
    id: string;
    total_score: number;
    dimension_scores: Record<string, { score: number }>;
    completed_at: string;
  } | null;
  facilitator: {
    name: string | null;
    calendly_url: string | null;
    logo_url: string | null;
  };
}

export default function PortalParticipante() {
  const navigate = useNavigate();
  const { user, signOut, isParticipant, loading: authLoading } = useAuth();
  const { isImpersonating, impersonatedUser } = useImpersonation();
  const [loading, setLoading] = useState(true);
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Determine if we're in impersonation mode for a participant
  const isImpersonatingParticipant = isImpersonating && impersonatedUser?.role === "participant";
  const effectiveParticipantId = isImpersonatingParticipant ? impersonatedUser.participantToken : null;

  useEffect(() => {
    // Skip auth check if impersonating
    if (isImpersonatingParticipant) {
      fetchPortalData();
      return;
    }

    if (!authLoading && !isParticipant) {
      navigate("/participante/login");
      return;
    }

    if (user && isParticipant) {
      fetchPortalData();
    }
  }, [user, isParticipant, authLoading, navigate, isImpersonatingParticipant]);

  const fetchPortalData = async () => {
    try {
      let data, error;

      if (effectiveParticipantId) {
        // Impersonation mode: fetch by participant ID
        const result = await supabase.rpc("get_participant_portal_data_by_id" as any, {
          _participant_id: effectiveParticipantId,
        });
        data = result.data;
        error = result.error;
      } else {
        // Normal mode: fetch by user ID
        const result = await supabase.rpc("get_participant_portal_data" as any, {
          _user_id: user!.id,
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Error fetching portal data:", error);
        toast.error("Erro ao carregar dados");
        return;
      }

      setPortalData(data as unknown as PortalData);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/participante/login");
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current || !portalData?.result) return;

    setIsGeneratingPDF(true);
    try {
      const dimensionScores = Object.entries(portalData.result.dimension_scores).map(
        ([dimension, data], index) => ({
          dimension,
          dimensionOrder: index + 1,
          score: data.score,
          maxScore: 5,
          percentage: (data.score / 5) * 100,
        })
      );

      const recommendations = getRecommendationsForWeakDimensions(
        getWeakestDimensions(dimensionScores).map((d) => d.dimension)
      );

      await generateDiagnosticPDF(contentRef.current, {
        participantName: portalData.participant.name,
        totalScore: portalData.result.total_score,
        dimensionScores,
        recommendations,
        completedAt: portalData.result.completed_at,
        facilitatorProfile: portalData.facilitator.logo_url
          ? { logo_url: portalData.facilitator.logo_url }
          : undefined,
      });
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!portalData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum dado encontrado</p>
      </div>
    );
  }

  const { participant, result, facilitator } = portalData;

  // Build dimension scores for display
  const dimensionScores = result
    ? Object.entries(result.dimension_scores).map(([dimension, data], index) => ({
        dimension,
        dimensionOrder: index + 1,
        score: data.score,
        maxScore: 5,
        percentage: (data.score / 5) * 100,
      }))
    : [];

  const weakDimensions = result ? getWeakestDimensions(dimensionScores) : [];
  const strongDimensions = result ? getStrongestDimensions(dimensionScores) : [];
  const recommendations = result
    ? getRecommendationsForWeakDimensions(weakDimensions.map((d) => d.dimension))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {facilitator.logo_url && (
              <img
                src={facilitator.logo_url}
                alt="Logo"
                className="h-8 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="font-semibold">Meus Resultados</h1>
              <p className="text-sm text-muted-foreground">{participant.name}</p>
            </div>
          </div>
          {!isImpersonatingParticipant && (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          )}
        </div>
      </header>

      <main ref={contentRef} className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Company Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="font-medium">{participant.company_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!result ? (
          /* No results yet */
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Diagnóstico não concluído</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não completou o diagnóstico IQ+IS.
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique seu e-mail para acessar o link do diagnóstico.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Score Header */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit mb-4">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Seu Resultado</CardTitle>
                <CardDescription>
                  Diagnóstico completado em{" "}
                  {new Date(result.completed_at).toLocaleDateString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="inline-flex items-center gap-2 bg-background rounded-full px-6 py-3 shadow-sm">
                  <span className="text-muted-foreground">Score Geral:</span>
                  <span className="text-3xl font-bold text-primary">
                    {result.total_score.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">/5</span>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral das 5 Dimensões</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsRadarChart scores={dimensionScores} />
              </CardContent>
            </Card>

            {/* Strong Points */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Seus Pontos Fortes</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {strongDimensions.map((score) => (
                  <DimensionCard key={score.dimension} score={score} isStrong />
                ))}
              </div>
            </div>

            {/* Development Areas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Áreas de Desenvolvimento</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {weakDimensions.map((score) => (
                  <DimensionCard key={score.dimension} score={score} isWeak />
                ))}
              </div>
            </div>

            {/* All Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Dimensão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dimensionScores.map((score) => (
                  <DimensionCard
                    key={score.dimension}
                    score={score}
                    isWeak={weakDimensions.some((w) => w.dimension === score.dimension)}
                    isStrong={strongDimensions.some((s) => s.dimension === score.dimension)}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <RecommendationList recommendations={recommendations} />

            {/* Schedule Feedback */}
            {facilitator.calendly_url && (
              <ScheduleFeedbackCard
                calendlyUrl={facilitator.calendly_url}
                participantName={participant.name}
              />
            )}

            {/* Actions */}
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
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
