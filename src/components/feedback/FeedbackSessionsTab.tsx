import { useState, useEffect, useMemo } from "react";
import { subDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackKPICards } from "./FeedbackKPICards";
import { FeedbackFilters } from "./FeedbackFilters";
import { FeedbackSessionsTable, FeedbackSession } from "./FeedbackSessionsTable";

interface Company {
  id: string;
  name: string;
}

const PERIOD_DAYS_MAP: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

export function FeedbackSessionsTab() {
  const [sessions, setSessions] = useState<FeedbackSession[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sessionsRes, companiesRes] = await Promise.all([
        supabase
          .from("feedback_sessions")
          .select(`
            id,
            status,
            scheduled_at,
            event_name,
            created_at,
            participant:participants(
              id,
              name,
              email,
              company:companies(id, name)
            )
          `)
          .order("scheduled_at", { ascending: false }),
        supabase.from("companies").select("id, name"),
      ]);

      if (sessionsRes.error) throw sessionsRes.error;
      if (companiesRes.error) throw companiesRes.error;

      // Transform the data to match our interface
      const transformedSessions: FeedbackSession[] = (sessionsRes.data || []).map((s: any) => ({
        id: s.id,
        status: s.status,
        scheduled_at: s.scheduled_at,
        event_name: s.event_name,
        created_at: s.created_at,
        participant: s.participant ? {
          id: s.participant.id,
          name: s.participant.name,
          email: s.participant.email,
          company: s.participant.company || null,
        } : null,
      }));

      setSessions(transformedSessions);
      setCompanies(companiesRes.data || []);
    } catch (error) {
      console.error("Error fetching feedback sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered sessions based on filters
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((s) => s.status === selectedStatus);
    }

    // Period filter
    if (selectedPeriod !== "all") {
      const days = PERIOD_DAYS_MAP[selectedPeriod];
      if (days) {
        const cutoffDate = subDays(new Date(), days);
        filtered = filtered.filter((s) => {
          if (!s.scheduled_at) return false;
          return new Date(s.scheduled_at) >= cutoffDate;
        });
      }
    }

    // Company filter
    if (selectedCompany !== "all") {
      filtered = filtered.filter((s) => s.participant?.company?.id === selectedCompany);
    }

    return filtered;
  }, [sessions, selectedStatus, selectedPeriod, selectedCompany]);

  // KPI calculations
  const kpiData = useMemo(() => {
    return {
      total: filteredSessions.length,
      scheduled: filteredSessions.filter((s) => s.status === "scheduled").length,
      completed: filteredSessions.filter((s) => s.status === "completed").length,
      cancelled: filteredSessions.filter((s) => s.status === "cancelled").length,
    };
  }, [filteredSessions]);

  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FeedbackFilters
        companies={companies}
        selectedStatus={selectedStatus}
        selectedPeriod={selectedPeriod}
        selectedCompany={selectedCompany}
        onStatusChange={setSelectedStatus}
        onPeriodChange={setSelectedPeriod}
        onCompanyChange={setSelectedCompany}
      />

      <FeedbackKPICards
        total={kpiData.total}
        scheduled={kpiData.scheduled}
        completed={kpiData.completed}
        cancelled={kpiData.cancelled}
        isLoading={isLoading}
      />

      <FeedbackSessionsTable
        sessions={filteredSessions}
        isLoading={isLoading}
        onRefresh={fetchData}
      />
    </div>
  );
}
