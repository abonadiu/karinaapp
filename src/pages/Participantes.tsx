import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Building2, Loader2, Download, UserPlus, Upload } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ParticipantList } from "@/components/participants/ParticipantList";
import { ParticipantForm, ParticipantFormData } from "@/components/participants/ParticipantForm";
import { ParticipantResultModal } from "@/components/participants/ParticipantResultModal";
import { CsvImport } from "@/components/participants/CsvImport";
import { AssignTestDialog } from "@/components/participants/AssignTestDialog";
import { ParticipantTestsList, useParticipantTestCounts } from "@/components/participants/ParticipantTestsList";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { supabase } from "@/integrations/backend/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DimensionScore } from "@/lib/diagnostic-scoring";
import { DiscResults } from "@/components/disc/DiscResults";
import { generateDiscPDF } from "@/lib/disc-pdf-generator";
import { Button } from "@/components/ui/button";
import {
  DiscDimensionScore,
  getDiscScoreLevel,
} from "@/lib/disc-scoring";
import {
  DISC_DIMENSIONS,
  getProfileDetail,
  getDiscRecommendations,
  getDiscActionPlan,
} from "@/lib/disc-descriptions";

type ParticipantStatus = "pending" | "invited" | "in_progress" | "completed";

interface Participant {
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

interface Company {
  id: string;
  name: string;
}

export default function Participantes() {
  const { user } = useAuth();
  const location = useLocation();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [deletingParticipant, setDeletingParticipant] = useState<Participant | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sendingInviteId, setSendingInviteId] = useState<string | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [selectedTestResult, setSelectedTestResult] = useState<any>(null);
  const [selectedTestTypeSlug, setSelectedTestTypeSlug] = useState<string | null>(null);
  const [isLoadingTestResult, setIsLoadingTestResult] = useState(false);
  const [isGeneratingDiscPDF, setIsGeneratingDiscPDF] = useState(false);

  // Assign test dialog
  const [assigningParticipant, setAssigningParticipant] = useState<Participant | null>(null);

  // Test counts for table column
  const participantIds = participants.map(p => p.id);
  const testCounts = useParticipantTestCounts(participantIds);

  function normalizeDimKey(dim: string): string {
    const d = dim.toLowerCase();
    if (d === "d" || d.includes("domin")) return "D";
    if (d === "i" || d.includes("influen")) return "I";
    if (d === "s" || d.includes("estabil")) return "S";
    if (d === "c" || d.includes("conform") || d.includes("cautela")) return "C";
    return dim;
  }

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    
    const [participantsResult, companiesResult] = await Promise.all([
      supabase
        .from("participants")
        .select("*, companies(name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("companies")
        .select("id, name")
        .order("name"),
    ]);

    if (participantsResult.error) {
      toast.error("Erro ao carregar participantes");
      console.error(participantsResult.error);
    } else {
      setParticipants((participantsResult.data || []) as Participant[]);
    }

    if (!companiesResult.error) {
      setCompanies(companiesResult.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (location.state?.statusFilter) {
      setStatusFilter(location.state.statusFilter);
    }
    if (location.state?.searchQuery) {
      setSearchTerm(location.state.searchQuery);
    }
  }, [location.state]);

  const handleCreateParticipant = async (data: ParticipantFormData) => {
    if (!user || !data.company_id) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("participants")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        department: data.department || null,
        position: data.position || null,
        company_id: data.company_id,
        facilitator_id: user.id,
      });

    if (error) {
      toast.error("Erro ao criar participante");
      console.error(error);
    } else {
      toast.success("Participante adicionado!");
      fetchData();
    }
    setIsSaving(false);
  };

  const handleCsvImport = async (
    csvParticipants: { name: string; email: string; phone?: string; department?: string; position?: string }[]
  ) => {
    if (!user) return;

    const targetCompanyId = companyFilter !== "all" ? companyFilter : null;
    if (!targetCompanyId) {
      toast.error("Selecione uma empresa no filtro antes de importar via CSV");
      return;
    }

    const rows = csvParticipants.map((p) => ({
      name: p.name,
      email: p.email,
      phone: p.phone || null,
      department: p.department || null,
      position: p.position || null,
      company_id: targetCompanyId,
      facilitator_id: user.id,
    }));

    const { error } = await supabase.from("participants").insert(rows);

    if (error) {
      toast.error("Erro ao importar participantes");
      console.error(error);
    } else {
      toast.success(`${rows.length} participantes importados!`);
      fetchData();
    }
  };

  const handleEditParticipant = async (data: ParticipantFormData) => {
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
      fetchData();
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

      fetchData();
    }
    setDeletingParticipant(null);
  };

  const handleInviteParticipant = async (participant: Participant) => {
    setSendingInviteId(participant.id);
    
    try {
      // Try to get the most recent participant_test token first
      const { data: testData } = await supabase
        .from("participant_tests")
        .select("access_token")
        .eq("participant_id", participant.id)
        .in("status", ["pending", "invited"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let accessToken = testData?.access_token;

      // Fallback to legacy participant token
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
      fetchData();
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
      fetchData();
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      toast.error(error.message || "Erro ao enviar lembrete");
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleAssignTest = async (participant: Participant) => {
    setAssigningParticipant(participant);
  };

  const [allResults, setAllResults] = useState<any[]>([]);

  const handleViewTestResult = async (participantTestId: string) => {
    setIsLoadingTestResult(true);
    setSelectedTestResult(null);
    setSelectedTestTypeSlug(null);

    try {
      // Fetch the participant_test to get test_type_id
      const { data: ptData } = await supabase
        .from("participant_tests")
        .select("*, test_types(slug)")
        .eq("id", participantTestId)
        .single();

      if (ptData) {
        setSelectedTestTypeSlug(ptData.test_types?.slug || null);
      }

      // Fetch the test result
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

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || participant.status === statusFilter;
    const matchesCompany = companyFilter === "all" || participant.company_id === companyFilter;

    return matchesSearch && matchesStatus && matchesCompany;
  });

  return (
    <DashboardLayout
      title="Participantes"
      description="Todos os participantes de todas as empresas"
    >
      {/* Action buttons */}
      <div className="flex flex-col gap-4 mb-6">
        <h3 className="text-lg font-medium text-foreground sr-only">Filtros</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar participantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[160px]">
              <Building2 className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="invited">Convidado</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (companyFilter === "all") {
                  toast.error("Selecione uma empresa no filtro antes de importar via CSV");
                  return;
                }
                setIsCsvOpen(true);
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Participante
            </Button>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`bg-card rounded-lg border p-4 text-left cursor-pointer hover:border-primary/50 transition-colors ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
        >
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{participants.length}</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
          className={`bg-card rounded-lg border p-4 text-left cursor-pointer hover:border-primary/50 transition-colors ${statusFilter === "pending" ? "ring-2 ring-primary" : ""}`}
        >
          <p className="text-sm text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-foreground">
            {participants.filter((p) => p.status === "pending").length}
          </p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "in_progress" ? "all" : "in_progress")}
          className={`bg-card rounded-lg border p-4 text-left cursor-pointer hover:border-primary/50 transition-colors ${statusFilter === "in_progress" ? "ring-2 ring-primary" : ""}`}
        >
          <p className="text-sm text-muted-foreground">Em andamento</p>
          <p className="text-2xl font-bold text-foreground">
            {participants.filter((p) => p.status === "in_progress").length}
          </p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
          className={`bg-card rounded-lg border p-4 text-left cursor-pointer hover:border-primary/50 transition-colors ${statusFilter === "completed" ? "ring-2 ring-primary" : ""}`}
        >
          <p className="text-sm text-muted-foreground">Concluídos</p>
          <p className="text-2xl font-bold text-foreground">
            {participants.filter((p) => p.status === "completed").length}
          </p>
        </button>
      </div>

      {/* Participant list */}
      <ParticipantList
        participants={filteredParticipants}
        onEdit={(participant) => setEditingParticipant(participant)}
        onDelete={(participant) => setDeletingParticipant(participant)}
        onInvite={handleInviteParticipant}
        onReminder={handleReminderParticipant}
        onRowClick={handleRowClick}
        onAssignTest={handleAssignTest}
        isLoading={isLoading}
        sendingInviteId={sendingInviteId}
        sendingReminderId={sendingReminderId}
        testCounts={testCounts}
      />

      {/* Edit participant form */}
      <ParticipantForm
        open={!!editingParticipant}
        onOpenChange={(open) => !open && setEditingParticipant(null)}
        onSubmit={handleEditParticipant}
        defaultValues={
          editingParticipant
            ? {
                name: editingParticipant.name,
                email: editingParticipant.email,
                phone: editingParticipant.phone || "",
                department: editingParticipant.department || "",
                position: editingParticipant.position || "",
              }
            : undefined
        }
        isEditing
        isLoading={isSaving}
      />

      {/* Create participant form */}
      <ParticipantForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateParticipant}
        isLoading={isSaving}
        companies={companies}
      />

      {/* CSV import */}
      <CsvImport
        open={isCsvOpen}
        onOpenChange={setIsCsvOpen}
        onImport={handleCsvImport}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingParticipant}
        onOpenChange={(open) => !open && setDeletingParticipant(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir participante?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingParticipant?.name}"? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteParticipant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign test dialog */}
      {assigningParticipant && (
        <AssignTestDialog
          open={!!assigningParticipant}
          onOpenChange={(open) => !open && setAssigningParticipant(null)}
          participantId={assigningParticipant.id}
          participantName={assigningParticipant.name}
          onAssigned={fetchData}
        />
      )}

      {/* Result sheet */}
      <Sheet
        open={!!selectedParticipant}
        onOpenChange={(open) => !open && setSelectedParticipant(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto p-6">
          <SheetHeader className="sr-only">
            <SheetTitle>{selectedParticipant?.name}</SheetTitle>
            <SheetDescription>Detalhes do participante</SheetDescription>
          </SheetHeader>

          {selectedParticipant && (
            <div className="space-y-6">
              {/* Participant info header */}
              <div>
                <h2 className="text-xl font-semibold text-foreground">{selectedParticipant.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedParticipant.email}</p>
              </div>

              {/* Tests list */}
              <ParticipantTestsList
                participantId={selectedParticipant.id}
                participantName={selectedParticipant.name}
                onViewResult={handleViewTestResult}
              />

              {/* Test result view (new flow) */}
              {isLoadingTestResult && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {selectedTestResult && !isLoadingTestResult && (
                <div className="mt-4">
                  {selectedTestTypeSlug === "disc" ? (
                    <>
                      <div className="flex justify-end mb-4">
                        <Button
                          onClick={async () => {
                            setIsGeneratingDiscPDF(true);
                            try {
                              const dimScores: DiscDimensionScore[] = Object.entries(
                                (selectedTestResult.dimension_scores || {}) as Record<string, any>
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
                                participantName: selectedParticipant.name,
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
                          }}
                          disabled={isGeneratingDiscPDF}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {isGeneratingDiscPDF ? "Gerando..." : "Exportar PDF"}
                        </Button>
                      </div>
                      <DiscResults
                        participantName={selectedParticipant.name}
                        existingResult={selectedTestResult}
                      />
                    </>
                  ) : (
                    <ParticipantResultModal
                      participantName={selectedParticipant.name}
                      completedAt={selectedTestResult.completed_at}
                      totalScore={Number(selectedTestResult.total_score)}
                      dimensionScores={
                        Object.entries(selectedTestResult.dimension_scores as Record<string, any>).map(
                          ([dimension, data]) => ({
                            dimension,
                            dimensionOrder: typeof data === 'object' ? ((data as any).dimensionOrder ?? 0) : 0,
                            score: typeof data === 'number' ? data : ((data as any).score ?? 0),
                            maxScore: typeof data === 'object' ? ((data as any).maxScore ?? 5) : 5,
                            percentage: typeof data === 'object' ? ((data as any).percentage ?? 0) : 0,
                          })
                        ) as DimensionScore[]
                      }
                      testTypeSlug={selectedTestTypeSlug || undefined}
                    />
                  )}
                </div>
              )}

              {/* Legacy result view */}
              {selectedParticipant.status === "completed" && (
                isLoadingResult ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : selectedResult ? (
                  <>
                    {allResults.length > 1 && (
                      <div className="mb-4">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Selecionar diagnóstico ({allResults.length} realizados)
                        </label>
                        <Select
                          value={selectedResult.id}
                          onValueChange={(id) => {
                            const found = allResults.find((r: any) => r.id === id);
                            if (found) setSelectedResult(found);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allResults.map((r: any, idx: number) => (
                              <SelectItem key={r.id} value={r.id}>
                                {new Date(r.completed_at).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}{" "}
                                — Score: {Number(r.total_score).toFixed(1)}
                                {idx === 0 ? " (mais recente)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <ParticipantResultModal
                      participantName={selectedParticipant.name}
                      completedAt={selectedResult.completed_at}
                      totalScore={Number(selectedResult.total_score)}
                      dimensionScores={
                        Object.entries(selectedResult.dimension_scores as Record<string, any>).map(
                          ([dimension, data]) => ({
                            dimension,
                            dimensionOrder: (data as any).dimensionOrder ?? 0,
                            score: (data as any).score ?? 0,
                            maxScore: (data as any).maxScore ?? 5,
                            percentage: (data as any).percentage ?? 0,
                          })
                        ) as DimensionScore[]
                      }
                    />
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Resultado não encontrado.
                  </p>
                )
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
