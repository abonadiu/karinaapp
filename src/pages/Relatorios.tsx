import { useEffect, useState } from "react";
import { format, parseISO, differenceInDays, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICards } from "@/components/analytics/KPICards";
import { MonthlyChart } from "@/components/analytics/MonthlyChart";
import { StatusPieChart } from "@/components/analytics/StatusPieChart";
import { CompanyComparisonChart } from "@/components/analytics/CompanyComparisonChart";
import { GlobalRadarChart } from "@/components/analytics/GlobalRadarChart";
import { supabase } from "@/integrations/supabase/client";
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

export default function Relatorios() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

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

  // KPI calculations
  const totalParticipants = participants.length;
  const completedParticipants = participants.filter((p) => p.status === "completed").length;
  const completionRate = totalParticipants > 0 ? (completedParticipants / totalParticipants) * 100 : 0;

  // Average completion time (from invited_at to completed_at)
  const completionTimes = participants
    .filter((p) => p.invited_at && p.completed_at)
    .map((p) => differenceInDays(parseISO(p.completed_at!), parseISO(p.invited_at!)));
  const averageCompletionDays =
    completionTimes.length > 0
      ? completionTimes.reduce((sum, days) => sum + days, 0) / completionTimes.length
      : null;

  // Monthly data
  const monthlyData = (() => {
    const monthMap = new Map<string, { created: number; completed: number }>();

    participants.forEach((p) => {
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
        // Simple sort by parsing the month string
        const [aMonth, aYear] = a.month.split("/");
        const [bMonth, bYear] = b.month.split("/");
        return aYear.localeCompare(bYear) || aMonth.localeCompare(bMonth);
      });
  })();

  // Status distribution
  const statusData = (() => {
    const statusMap = new Map<string, number>();
    participants.forEach((p) => {
      statusMap.set(p.status, (statusMap.get(p.status) || 0) + 1);
    });

    return Array.from(statusMap.entries()).map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      color: STATUS_COLORS[status] || "hsl(var(--muted))",
    }));
  })();

  // Company comparison
  const companyData = (() => {
    const companyMap = new Map<string, { scores: number[]; name: string }>();

    companies.forEach((c) => {
      companyMap.set(c.id, { scores: [], name: c.name });
    });

    results.forEach((r) => {
      const participant = participants.find((p) => p.id === r.participant_id);
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
  })();

  // Global dimension averages
  const dimensionData = (() => {
    const dimensionMap = new Map<string, number[]>();

    results.forEach((r) => {
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
  })();

  return (
    <DashboardLayout
      title="Relatórios"
      description="Análise de desempenho e métricas de engajamento"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <KPICards
          totalParticipants={totalParticipants}
          completedParticipants={completedParticipants}
          completionRate={completionRate}
          averageCompletionDays={averageCompletionDays}
          isLoading={isLoading}
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
      </div>
    </DashboardLayout>
  );
}
