import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { supabase } from "@/integrations/backend/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LogOut, Award, Building2, User, ClipboardList, Download } from "lucide-react";
import { ScheduleFeedbackCard } from "@/components/diagnostic/ScheduleFeedbackCard";
import { TestResultCard, type TestData } from "@/components/participante/TestResultCard";
import { ResultsRadarChart } from "@/components/diagnostic/ResultsRadarChart";
import { DimensionCard } from "@/components/diagnostic/DimensionCard";
import { RecommendationList } from "@/components/diagnostic/RecommendationList";
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
  facilitator: {
    name: string | null;
    calendly_url: string | null;
    logo_url: string | null;
  };
  tests: TestData[];
  legacy_result: {
    id: string;
    total_score: number;
    dimension_scores: Record<string, { score: number }>;
    completed_at: string;
  } | null;
}

export default function PortalParticipante() {
  const navigate = useNavigate();
  const { user, signOut, isParticipant, loading: authLoading } = useAuth();
  const { isImpersonating, impersonatedUser } = useImpersonation();
  const [loading, setLoading] = useState(true);
  const [portalData, setPortalData] = useState<PortalData | null>(null);

  const isImpersonatingParticipant = isImpersonating && impersonatedUser?.role === "participant";
  const effectiveParticipantId = isImpersonatingParticipant ? impersonatedUser.participantToken : null;

  useEffect(() => {
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
        const result = await supabase.rpc("get_participant_portal_full_data_by_id" as any, {
          _participant_id: effectiveParticipantId,
        });
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase.rpc("get_participant_portal_full_data" as any, {
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

  const { participant, facilitator, tests, legacy_result } = portalData;
  const hasTests = tests && tests.length > 0;
  const completedTests = hasTests ? tests.filter((t) => t.status === "completed") : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {facilitator.logo_url && (
              <img src={facilitator.logo_url} alt="Logo" className="h-8 w-auto object-contain" />
            )}
            <div>
              <h1 className="font-semibold text-lg">Meus Resultados</h1>
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

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Facilitador</p>
                  <p className="font-medium">{facilitator.name || "Não atribuído"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tests Section */}
        {hasTests ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                Meus Testes ({tests.length})
              </h2>
              {completedTests.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  · {completedTests.length} concluído{completedTests.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {tests.map((test) => (
                <TestResultCard
                  key={test.id}
                  test={test}
                  participantName={participant.name}
                  facilitatorLogoUrl={facilitator.logo_url}
                />
              ))}
            </div>
          </div>
        ) : legacy_result ? (
          <LegacyResultView
            result={legacy_result}
            participantName={participant.name}
            facilitator={facilitator}
          />
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum teste atribuído</h3>
              <p className="text-muted-foreground">
                Você ainda não possui testes atribuídos. Verifique seu e-mail para mais informações.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Schedule Feedback */}
        {facilitator.calendly_url && (
          <ScheduleFeedbackCard
            calendlyUrl={facilitator.calendly_url}
            participantName={participant.name}
          />
        )}
      </main>
    </div>
  );
}

/* Legacy result fallback component */
function LegacyResultView({
  result,
  participantName,
  facilitator,
}: {
  result: NonNullable<PortalData["legacy_result"]>;
  participantName: string;
  facilitator: PortalData["facilitator"];
}) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const dimensionScores = Object.entries(result.dimension_scores).map(([dimension, data], index) => ({
    dimension,
    dimensionOrder: index + 1,
    score: data.score,
    maxScore: 5,
    percentage: (data.score / 5) * 100,
  }));

  const weakDimensions = getWeakestDimensions(dimensionScores);
  const strongDimensions = getStrongestDimensions(dimensionScores);
  const recommendations = getRecommendationsForWeakDimensions(weakDimensions.map((d) => d.dimension));

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsGeneratingPDF(true);
    try {
      await generateDiagnosticPDF(contentRef.current, {
        participantName,
        totalScore: result.total_score,
        dimensionScores,
        recommendations,
        completedAt: result.completed_at,
        facilitatorProfile: facilitator.logo_url ? { logo_url: facilitator.logo_url } : undefined,
      });
      toast.success("PDF gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div ref={contentRef} className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6 text-center">
          <Award className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="text-xl font-semibold mb-1">Diagnóstico de Consciência Integral</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Concluído em {new Date(result.completed_at).toLocaleDateString("pt-BR")}
          </p>
          <div className="inline-flex items-center gap-2 bg-background rounded-full px-6 py-3 shadow-sm">
            <span className="text-muted-foreground">Score:</span>
            <span className="text-3xl font-bold text-primary">{result.total_score.toFixed(1)}</span>
            <span className="text-muted-foreground">/5</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ResultsRadarChart scores={dimensionScores} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {dimensionScores.map((s) => (
          <DimensionCard
            key={s.dimension}
            score={s}
            isWeak={weakDimensions.some((w) => w.dimension === s.dimension)}
            isStrong={strongDimensions.some((st) => st.dimension === s.dimension)}
          />
        ))}
      </div>

      {recommendations.length > 0 && <RecommendationList recommendations={recommendations} />}

      <div className="flex justify-center pdf-hide">
        <Button variant="outline" className="gap-2" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
          {isGeneratingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isGeneratingPDF ? "Gerando PDF..." : "Baixar PDF"}
        </Button>
      </div>
    </div>
  );
}
