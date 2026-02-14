import { useState } from "react";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";
import { generateDiscPDF } from "@/lib/disc-pdf-generator";
import {
  DiscDimensionScore,
} from "@/lib/disc-scoring";
import {
  DISC_DIMENSIONS,
  getProfileDetail,
  getDiscRecommendations,
  getDiscActionPlan,
} from "@/lib/disc-descriptions";

type ParticipantStatus = "pending" | "invited" | "in_progress" | "completed";

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  department: string | null;
  position: string | null;
  status: ParticipantStatus;
  company_id: string;
  created_at: string;
  access_token?: string;
  invited_at?: string | null;
  companies?: {
    name: string;
  };
}

function normalizeDimKey(dim: string): string {
  const d = dim.toLowerCase();
  if (d === "d" || d.includes("domin")) return "D";
  if (d === "i" || d.includes("influen")) return "I";
  if (d === "s" || d.includes("estabil")) return "S";
  if (d === "c" || d.includes("conform") || d.includes("cautela")) return "C";
  return dim;
}

export function useParticipantActions(onRefresh: () => void) {
  const [sendingInviteId, setSendingInviteId] = useState<string | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [deletingParticipant, setDeletingParticipant] = useState<Participant | null>(null);
  const [assigningParticipant, setAssigningParticipant] = useState<Participant | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [selectedTestResult, setSelectedTestResult] = useState<any>(null);
  const [selectedTestTypeSlug, setSelectedTestTypeSlug] = useState<string | null>(null);
  const [isLoadingTestResult, setIsLoadingTestResult] = useState(false);
  const [isGeneratingDiscPDF, setIsGeneratingDiscPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInviteParticipant = async (participant: Participant) => {
    setSendingInviteId(participant.id);
    try {
      const { data: testData } = await supabase
        .from("participant_tests")
        .select("access_token")
        .eq("participant_id", participant.id)
        .in("status", ["pending", "invited"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let accessToken = testData?.access_token;

      if (!accessToken) {
        const { data: participantData, error: fetchError } = await supabase
          .from("participants")
          .select("access_token")
          .eq("id", participant.id)
          .single();

        if (fetchError || !participantData?.access_token) {
          throw new Error("Não foi possível obter o token do participante");
        }
        accessToken = participantData.access_token;
      }

      const diagnosticUrl = `${window.location.origin}/diagnostico/${accessToken}`;

      const { error: invokeError } = await supabase.functions.invoke("send-invite", {
        body: {
          participantName: participant.name,
          participantEmail: participant.email,
          diagnosticUrl,
        },
      });

      if (invokeError) throw invokeError;

      const { error: updateError } = await supabase
        .from("participants")
        .update({
          status: "invited",
          invited_at: new Date().toISOString(),
        })
        .eq("id", participant.id);

      if (updateError) throw updateError;

      toast.success(`Convite enviado para ${participant.name}!`);
      onRefresh();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast.error(error.message || "Erro ao enviar convite");
    } finally {
      setSendingInviteId(null);
    }
  };

  const handleReminderParticipant = async (participant: Participant) => {
    setSendingReminderId(participant.id);
    try {
      let daysSinceInvite = 0;
      if (participant.invited_at) {
        const invitedDate = new Date(participant.invited_at);
        const now = new Date();
        daysSinceInvite = Math.floor((now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      const { error: invokeError } = await supabase.functions.invoke("send-reminder", {
        body: {
          participantId: participant.id,
          participantName: participant.name,
          participantEmail: participant.email,
          accessToken: participant.access_token,
          daysSinceInvite,
        },
      });

      if (invokeError) throw invokeError;

      toast.success(`Lembrete enviado para ${participant.name}!`);
      onRefresh();
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      toast.error(error.message || "Erro ao enviar lembrete");
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleEditParticipant = async (data: { name: string; email: string; phone?: string; department?: string; position?: string }) => {
    if (!editingParticipant) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("participants")
      .update({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        department: data.department || null,
        position: data.position || null,
      })
      .eq("id", editingParticipant.id);

    if (error) {
      toast.error("Erro ao atualizar participante");
      console.error(error);
    } else {
      toast.success("Participante atualizado!");
      onRefresh();
    }
    setIsSaving(false);
    setEditingParticipant(null);
  };

  const handleDeleteParticipant = async () => {
    if (!deletingParticipant) return;

    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("id", deletingParticipant.id);

    if (error) {
      toast.error("Erro ao excluir participante");
      console.error(error);
    } else {
      toast.success("Participante excluído!");

      const { data: participantCount } = await supabase
        .from("participants")
        .select("id", { count: "exact" })
        .eq("company_id", deletingParticipant.company_id);

      await supabase
        .from("companies")
        .update({ used_licenses: (participantCount?.length || 0) })
        .eq("id", deletingParticipant.company_id);

      onRefresh();
    }
    setDeletingParticipant(null);
  };

  const handleAssignTest = (participant: Participant) => {
    setAssigningParticipant(participant);
  };

  const handleViewTestResult = async (participantTestId: string) => {
    setIsLoadingTestResult(true);
    setSelectedTestResult(null);
    setSelectedTestTypeSlug(null);

    try {
      const { data: ptData } = await supabase
        .from("participant_tests")
        .select("*, test_types(slug)")
        .eq("id", participantTestId)
        .single();

      if (ptData) {
        setSelectedTestTypeSlug(ptData.test_types?.slug || null);
      }

      const { data: resultData, error } = await supabase
        .from("test_results")
        .select("*")
        .eq("participant_test_id", participantTestId)
        .single();

      if (error) {
        console.error("Error fetching test result:", error);
        toast.error("Erro ao carregar resultado");
      } else if (resultData) {
        setSelectedTestResult(resultData);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoadingTestResult(false);
    }
  };

  const handleRowClick = async (participant: Participant) => {
    setSelectedParticipant(participant);
    setSelectedResult(null);
    setAllResults([]);
    setSelectedTestResult(null);
    setSelectedTestTypeSlug(null);

    if (participant.status === "completed") {
      setIsLoadingResult(true);
      const { data, error } = await supabase
        .from("diagnostic_results")
        .select("*")
        .eq("participant_id", participant.id)
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error fetching result:", error);
      } else if (data && data.length > 0) {
        setAllResults(data);
        setSelectedResult(data[0]);
      }
      setIsLoadingResult(false);
    }
  };

  const handleGenerateDiscPDF = async (participantName: string, testResult: any) => {
    setIsGeneratingDiscPDF(true);
    try {
      const dimScores: DiscDimensionScore[] = Object.entries(
        (testResult.dimension_scores || {}) as Record<string, any>
      ).map(([dim, score]: [string, any]) => {
        const normKey = normalizeDimKey(dim);
        return {
          dimension: normKey,
          dimensionLabel: DISC_DIMENSIONS[normKey]?.name || dim,
          score: Number(score),
          maxScore: 5,
          percentage: Number(((Number(score) / 5) * 100).toFixed(1)),
          color: DISC_DIMENSIONS[normKey]?.color || "#6B7280",
        };
      });
      const sorted = [...dimScores].sort((a, b) => b.score - a.score);
      const primary = sorted[0]?.dimension || "S";
      const secondary = sorted[1]?.dimension || "I";
      const profile = {
        primary,
        secondary,
        label: `${DISC_DIMENSIONS[primary]?.name} ${DISC_DIMENSIONS[secondary]?.name}`,
        description: "",
      };
      const profileDetail = getProfileDetail(primary, secondary);
      const recommendations = getDiscRecommendations(primary, secondary, dimScores);
      const actionPlan = getDiscActionPlan(primary, secondary);
      await generateDiscPDF({
        participantName,
        dimensionScores: dimScores,
        profile,
        profileDetail,
        recommendations,
        actionPlan,
      });
      toast.success("PDF gerado com sucesso!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGeneratingDiscPDF(false);
    }
  };

  return {
    // States
    sendingInviteId,
    sendingReminderId,
    editingParticipant,
    setEditingParticipant,
    deletingParticipant,
    setDeletingParticipant,
    assigningParticipant,
    setAssigningParticipant,
    selectedParticipant,
    setSelectedParticipant,
    selectedResult,
    setSelectedResult,
    allResults,
    isLoadingResult,
    selectedTestResult,
    selectedTestTypeSlug,
    isLoadingTestResult,
    isGeneratingDiscPDF,
    isSaving,

    // Actions
    handleInviteParticipant,
    handleReminderParticipant,
    handleEditParticipant,
    handleDeleteParticipant,
    handleAssignTest,
    handleViewTestResult,
    handleRowClick,
    handleGenerateDiscPDF,
  };
}
