import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Loader2
} from "lucide-react";

import { PortalLayout } from "@/components/empresa/PortalLayout";
import { TeamProgressCard } from "@/components/empresa/TeamProgressCard";
import { AggregateRadarChart } from "@/components/empresa/AggregateRadarChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { generateTeamPDF } from "@/lib/team-pdf-generator";
import { DimensionScore } from "@/lib/diagnostic-scoring";

interface AggregateStats {
  total_participants: number;
  completed: number;
  in_progress: number;
  pending: number;
}

interface DimensionAverage {
  dimension: string;
  average: number;
}

interface ActivityItem {
  description: string;
  completed_at: string;
}

export default function PortalEmpresa() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [dimensionAverages, setDimensionAverages] = useState<DimensionAverage[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // 1. Get manager's company ID
        const { data: companyIdData, error: companyIdError } = await supabase
          .rpc('get_manager_company_id', { _user_id: user.id });

        if (companyIdError) throw companyIdError;

        if (!companyIdData) {
          toast.error("Você não está associado a nenhuma empresa");
          navigate("/empresa/login");
          return;
        }

        setCompanyId(companyIdData);

        // 2. Get company name
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("name")
          .eq("id", companyIdData)
          .single();

        if (companyError) throw companyError;
        setCompanyName(companyData?.name || "Sua Empresa");

        // 3. Get aggregate stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_company_aggregate_stats', { p_company_id: companyIdData });

        if (statsError) throw statsError;
        if (statsData) {
          setStats(statsData as unknown as AggregateStats);
        }

        // 4. Get dimension averages
        const { data: avgData, error: avgError } = await supabase
          .rpc('get_company_dimension_averages', { p_company_id: companyIdData });

        if (avgError) throw avgError;
        if (avgData && Array.isArray(avgData)) {
          setDimensionAverages(avgData as unknown as DimensionAverage[]);
        }

        // 5. Get activity timeline
        const { data: activityData, error: activityError } = await supabase
          .rpc('get_company_activity_timeline', { 
            p_company_id: companyIdData,
            p_limit: 5
          });

        if (activityError) throw activityError;
        if (activityData && Array.isArray(activityData)) {
          setActivity(activityData as unknown as ActivityItem[]);
        }

      } catch (error: any) {
        console.error("Error fetching portal data:", error);
        toast.error("Erro ao carregar dados do portal");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const handleDownloadReport = async () => {
    if (!companyId || !stats || stats.completed === 0) {
      toast.error("Não há resultados suficientes para gerar o relatório");
      return;
    }

    setIsDownloading(true);

    try {
      // Convert dimension averages to DimensionScore format
      const dimensionScores: DimensionScore[] = dimensionAverages.map((d, index) => ({
        dimension: d.dimension,
        dimensionOrder: index + 1,
        score: d.average,
        maxScore: 5,
        percentage: (d.average / 5) * 100,
      }));

      // Calculate team average score
      const teamAvg = dimensionScores.length > 0
        ? dimensionScores.reduce((acc, d) => acc + d.score, 0) / dimensionScores.length
        : 0;

      await generateTeamPDF({
        companyName,
        facilitatorName: "Portal da Empresa",
        totalParticipants: stats.total_participants,
        completedCount: stats.completed,
        inProgressCount: stats.in_progress,
        pendingCount: stats.pending,
        teamAverageScore: teamAvg,
        teamDimensionScores: dimensionScores,
        participantResults: [], // Manager view doesn't have individual results
      });

      toast.success("Relatório gerado com sucesso!");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsDownloading(false);
    }
  };

  // Calculate highlights (top 2 strengths and areas for development)
  const sortedDimensions = [...dimensionAverages].sort((a, b) => b.average - a.average);
  const strengths = sortedDimensions.slice(0, 2);
  const improvements = sortedDimensions.slice(-2).reverse();

  const completionRate = stats 
    ? Math.round((stats.completed / Math.max(stats.total_participants, 1)) * 100)
    : 0;

  if (authLoading || isLoading) {
    return (
      <PortalLayout companyName="Carregando...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout companyName={companyName}>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Bem-vindo ao Portal da {companyName}
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o progresso dos diagnósticos da sua equipe
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <TeamProgressCard
          icon={Users}
          title="Total de Colaboradores"
          value={stats?.total_participants || 0}
          variant="default"
        />
        <TeamProgressCard
          icon={CheckCircle}
          title="Concluídos"
          value={stats?.completed || 0}
          subtitle={`${completionRate}% do total`}
          variant="success"
        />
        <TeamProgressCard
          icon={Clock}
          title="Em Andamento"
          value={stats?.in_progress || 0}
          variant="warning"
        />
        <TeamProgressCard
          icon={AlertCircle}
          title="Pendentes"
          value={stats?.pending || 0}
          variant="muted"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Radar Chart */}
        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle>Perfil da Equipe</CardTitle>
            <CardDescription>
              Médias agregadas por dimensão do diagnóstico
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dimensionAverages.length > 0 ? (
              <AggregateRadarChart data={dimensionAverages} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Nenhum diagnóstico concluído ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle>Destaques da Equipe</CardTitle>
            <CardDescription>
              Pontos fortes e áreas de desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {dimensionAverages.length > 0 ? (
              <>
                {/* Strengths */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Pontos Fortes
                  </h4>
                  <div className="space-y-2">
                    {strengths.map((d) => (
                      <div 
                        key={d.dimension} 
                        className="flex justify-between items-center bg-green-50 dark:bg-green-950/30 rounded-lg p-3"
                      >
                        <span className="font-medium text-foreground">{d.dimension}</span>
                        <span className="text-green-600 font-bold">{d.average.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas for development */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-amber-500" />
                    Áreas de Desenvolvimento
                  </h4>
                  <div className="space-y-2">
                    {improvements.map((d) => (
                      <div 
                        key={d.dimension} 
                        className="flex justify-between items-center bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3"
                      >
                        <span className="font-medium text-foreground">{d.dimension}</span>
                        <span className="text-amber-600 font-bold">{d.average.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <p>Aguardando conclusão de diagnósticos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="shadow-warm mb-8">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas conclusões de diagnósticos (sem identificação)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length > 0 ? (
            <div className="space-y-3">
              {activity.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-foreground">{item.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.completed_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma atividade recente
            </p>
          )}
        </CardContent>
      </Card>

      {/* Download Report */}
      <Card className="shadow-warm">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="font-semibold text-foreground">Relatório da Equipe</h3>
            <p className="text-sm text-muted-foreground">
              Baixe o relatório consolidado com os resultados agregados da equipe
            </p>
          </div>
          <Button 
            onClick={handleDownloadReport}
            disabled={isDownloading || !stats || stats.completed === 0}
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Baixar Relatório
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
