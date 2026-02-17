import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, differenceInDays, startOfMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart3, Calendar, FileText } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICards } from "@/components/analytics/KPICards";
import { MonthlyChart } from "@/components/analytics/MonthlyChart";
import { StatusPieChart } from "@/components/analytics/StatusPieChart";
import { CompanyComparisonChart } from "@/components/analytics/CompanyComparisonChart";
import { GlobalRadarChart } from "@/components/analytics/GlobalRadarChart";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { CompanyDetailsTable } from "@/components/analytics/CompanyDetailsTable";
import { ScoreEvolutionChart } from "@/components/analytics/ScoreEvolutionChart";
import { ExportPDFButton } from "@/components/analytics/ExportPDFButton";
import { FeedbackSessionsTab } from "@/components/feedback/FeedbackSessionsTab";
import { ReportsIndividualTab } from "@/components/analytics/ReportsIndividualTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/backend/client";
import { useAuth } from "@/contexts/AuthContext";

interface Participant {
  id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  invited_at: string | null;
  company_id: string;
}

interface Company {
  id: string;
  name: string;
}

interface DiagnosticResult {
  participant_id: string;
  total_score: number;
  dimension_scores: Record<string, number>;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  invited: "Convidado",
  in_progress: "Em Progresso",
  completed: "Concluído",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(var(--muted-foreground))",
  invited: "hsl(var(--primary))",
  in_progress: "hsl(var(--accent))",
  completed: "hsl(var(--success))",
};

const DIMENSION_SHORT_NAMES: Record<string, string> = {
  "Coerência Emocional": "Coerência",
  "Relações e Compaixão": "Relações",
  "Conexão e Propósito": "Conexão",
  "Consciência Interior": "Consciência",
  "Transformação": "Transformação",
};

const PERIOD_DAYS_MAP: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

export default function Relatorios() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleKPIClick = (cardId: string) => {
    switch (cardId) {
      case "total":
        navigate("/participantes");
        break;
      case "completed":
        navigate("/participantes", { state: { statusFilter: "completed" } });
        break;
      case "completion_rate":
        navigate("/participantes", { state: { statusFilter: "in_progress" } });
        break;
      case "avg_days":
        navigate("/participantes", { state: { statusFilter: "completed" } });
        break;
    }
  };

  const handleCompanyClick = (companyId: string) => {
    navigate(`/empresas/${companyId}`);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  
  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);

      const [participantsRes, companiesRes, resultsRes] = await Promise.all([
        supabase.from("participants").select("id, status, created_at, completed_at, invited_at, company_id"),
        supabase.from("companies").select("id, name"),
        supabase.from("diagnostic_results").select("participant_id, total_score, dimension_scores"),
      ]);

      setParticipants(participantsRes.data || []);
      setCompanies(companiesRes.data || []);
      setResults((resultsRes.data || []) as DiagnosticResult[]);
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  // Filtered participants based on period and company
  const filteredParticipants = useMemo(() => {
    let filtered = participants;

    // Period filter
    if (selectedPeriod !== "all") {
      const days = PERIOD_DAYS_MAP[selectedPeriod];
      if (days) {
        const cutoffDate = subDays(new Date(), days);
        filtered = filtered.filter((p) => parseISO(p.created_at) >= cutoffDate);
      }
    }

    // Company filter
    if (selectedCompany !== "all") {
      filtered = filtered.filter((p) => p.company_id === selectedCompany);
    }

    return filtered;
  }, [participants, selectedPeriod, selectedCompany]);

  // Filtered results based on filtered participants
  const filteredResults = useMemo(() => {
    const participantIds = new Set(filteredParticipants.map((p) => p.id));
    return results.filter((r) => participantIds.has(r.participant_id));
  }, [results, filteredParticipants]);

  // KPI calculations
  const totalParticipants = filteredParticipants.length;
  const completedParticipants = filteredParticipants.filter((p) => p.status === "completed").length;
  const completionRate = totalParticipants > 0 ? (completedParticipants / totalParticipants) * 100 : 0;

  // Average completion time (from invited_at to completed_at)
  const completionTimes = filteredParticipants
    .filter((p) => p.invited_at && p.completed_at)
    .map((p) => differenceInDays(parseISO(p.completed_at!), parseISO(p.invited_at!)));
  const averageCompletionDays =
    completionTimes.length > 0
      ? completionTimes.reduce((sum, days) => sum + days, 0) / completionTimes.length
      : null;

  // Monthly data
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { created: number; completed: number }>();

    filteredParticipants.forEach((p) => {
      const createdMonth = format(startOfMonth(parseISO(p.created_at)), "MMM/yy", { locale: ptBR });
      const current = monthMap.get(createdMonth) || { created: 0, completed: 0 };
      current.created++;
      monthMap.set(createdMonth, current);

      if (p.completed_at) {
        const completedMonth = format(startOfMonth(parseISO(p.completed_at)), "MMM/yy", { locale: ptBR });
        const completedCurrent = monthMap.get(completedMonth) || { created: 0, completed: 0 };
        completedCurrent.completed++;
        monthMap.set(completedMonth, completedCurrent);
      }
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split("/");
        const [bMonth, bYear] = b.month.split("/");
        return aYear.localeCompare(bYear) || aMonth.localeCompare(bMonth);
      });
  }, [filteredParticipants]);

  // Status distribution
  const statusData = useMemo(() => {
    const statusMap = new Map<string, number>();
    filteredParticipants.forEach((p) => {
      statusMap.set(p.status, (statusMap.get(p.status) || 0) + 1);
    });

    return Array.from(statusMap.entries()).map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      color: STATUS_COLORS[status] || "hsl(var(--muted))",
    }));
  }, [filteredParticipants]);

  // Company comparison
  const companyData = useMemo(() => {
    const companyMap = new Map<string, { scores: number[]; name: string }>();

    companies.forEach((c) => {
      companyMap.set(c.id, { scores: [], name: c.name });
    });

    filteredResults.forEach((r) => {
      const participant = filteredParticipants.find((p) => p.id === r.participant_id);
      if (participant && companyMap.has(participant.company_id)) {
        companyMap.get(participant.company_id)!.scores.push(Number(r.total_score));
      }
    });

    return Array.from(companyMap.entries())
      .filter(([_, data]) => data.scores.length > 0)
      .map(([id, data]) => ({
        name: data.name.length > 15 ? data.name.substring(0, 15) + "..." : data.name,
        average: data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length,
        participants: data.scores.length,
      }));
  }, [companies, filteredResults, filteredParticipants]);

  // Global dimension averages
  const dimensionData = useMemo(() => {
    const dimensionMap = new Map<string, number[]>();

    filteredResults.forEach((r) => {
      if (r.dimension_scores && typeof r.dimension_scores === "object") {
        Object.entries(r.dimension_scores).forEach(([dim, score]) => {
          if (!dimensionMap.has(dim)) {
            dimensionMap.set(dim, []);
          }
          dimensionMap.get(dim)!.push(Number(score));
        });
      }
    });

    return Array.from(dimensionMap.entries()).map(([dimension, scores]) => ({
      dimension,
      shortName: DIMENSION_SHORT_NAMES[dimension] || dimension,
      average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    }));
  }, [filteredResults]);

  // Company details for table
  const companyDetails = useMemo(() => {
    return companies.map((company) => {
      const companyParticipants = filteredParticipants.filter(
        (p) => p.company_id === company.id
      );
      const completed = companyParticipants.filter((p) => p.status === "completed");
      const companyResults = filteredResults.filter((r) =>
        completed.some((p) => p.id === r.participant_id)
      );

      return {
        id: company.id,
        name: company.name,
        total: companyParticipants.length,
        completed: completed.length,
        inProgress: companyParticipants.filter((p) => p.status === "in_progress").length,
        pending: companyParticipants.filter((p) => p.status === "pending" || p.status === "invited").length,
        averageScore: companyResults.length > 0
          ? companyResults.reduce((sum, r) => sum + Number(r.total_score), 0) / companyResults.length
          : null,
        completionRate: companyParticipants.length > 0
          ? (completed.length / companyParticipants.length) * 100
          : 0,
      };
    }).filter((c) => c.total > 0);
  }, [companies, filteredParticipants, filteredResults]);

  // Score evolution over time
  const scoreEvolution = useMemo(() => {
    const monthMap = new Map<string, { scores: number[]; date: Date }>();

    filteredResults.forEach((result) => {
      const participant = participants.find((p) => p.id === result.participant_id);
      if (participant?.completed_at) {
        const completedDate = parseISO(participant.completed_at);
        const monthKey = format(startOfMonth(completedDate), "MMM/yy", { locale: ptBR });
        
        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, { scores: [], date: startOfMonth(completedDate) });
        }
        monthMap.get(monthKey)!.scores.push(Number(result.total_score));
      }
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        average: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
        count: data.scores.length,
        date: data.date,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredResults, participants]);

  return (
    <DashboardLayout
      title="Relatórios"
      description="Análise de desempenho e métricas de engajamento"
    >
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="metrics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="individual" className="gap-2">
            <FileText className="h-4 w-4" />
            Individuais
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <Calendar className="h-4 w-4" />
            Sessões de Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <AnalyticsFilters
              companies={companies}
              selectedPeriod={selectedPeriod}
              selectedCompany={selectedCompany}
              onPeriodChange={setSelectedPeriod}
              onCompanyChange={setSelectedCompany}
            />
            <ExportPDFButton
              kpiData={{
                totalParticipants,
                completedParticipants,
                completionRate,
                averageCompletionDays,
              }}
              companyDetails={companyDetails}
              selectedPeriod={selectedPeriod}
              selectedCompany={selectedCompany}
            />
          </div>

          {/* KPI Cards */}
          <KPICards
            totalParticipants={totalParticipants}
            completedParticipants={completedParticipants}
            completionRate={completionRate}
            averageCompletionDays={averageCompletionDays}
            isLoading={isLoading}
            onCardClick={handleKPIClick}
          />

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyChart data={monthlyData} isLoading={isLoading} />
            <StatusPieChart data={statusData} isLoading={isLoading} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompanyComparisonChart data={companyData} isLoading={isLoading} />
            <GlobalRadarChart data={dimensionData} isLoading={isLoading} />
          </div>

          {/* Company Details Table */}
          <CompanyDetailsTable data={companyDetails} isLoading={isLoading} onCompanyClick={handleCompanyClick} />

          {/* Score Evolution Chart */}
          <ScoreEvolutionChart data={scoreEvolution} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="individual">
          <ReportsIndividualTab companies={companies} />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackSessionsTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
