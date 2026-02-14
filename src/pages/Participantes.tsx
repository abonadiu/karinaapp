import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Building2, Clock, Loader2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ParticipantList } from "@/components/participants/ParticipantList";
import { ParticipantForm, ParticipantFormData } from "@/components/participants/ParticipantForm";
import { ParticipantResultModal } from "@/components/participants/ParticipantResultModal";
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
import { StatusBadge } from "@/components/participants/StatusBadge";
import { supabase } from "@/integrations/backend/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DimensionScore } from "@/lib/diagnostic-scoring";

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
  const [isSaving, setIsSaving] = useState(false);
  const [sendingInviteId, setSendingInviteId] = useState<string | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);

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
  }, [location.state]);

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
      
      // Update used licenses count
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
      // 1. Fetch participant's access_token
      const { data: participantData, error: fetchError } = await supabase
        .from("participants")
        .select("access_token")
        .eq("id", participant.id)
        .single();

      if (fetchError || !participantData?.access_token) {
        throw new Error("Não foi possível obter o token do participante");
      }

      // 2. Build diagnostic URL
      const diagnosticUrl = `${window.location.origin}/diagnostico/${participantData.access_token}`;

      // 3. Call edge function to send email
      const { error: invokeError } = await supabase.functions.invoke("send-invite", {
        body: {
          participantName: participant.name,
          participantEmail: participant.email,
          diagnosticUrl,
        },
      });

      if (invokeError) {
        throw invokeError;
      }

      // 4. Update participant status
      const { error: updateError } = await supabase
        .from("participants")
        .update({
          status: "invited",
          invited_at: new Date().toISOString(),
        })
        .eq("id", participant.id);

      if (updateError) {
        throw updateError;
      }

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
      // Calculate days since invite
      let daysSinceInvite = 0;
      if (participant.invited_at) {
        const invitedDate = new Date(participant.invited_at);
        const now = new Date();
        daysSinceInvite = Math.floor((now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Call edge function to send reminder
      const { error: invokeError } = await supabase.functions.invoke("send-reminder", {
        body: {
          participantId: participant.id,
          participantName: participant.name,
          participantEmail: participant.email,
          accessToken: participant.access_token,
          daysSinceInvite,
        },
      });

      if (invokeError) {
        throw invokeError;
      }

      toast.success(`Lembrete enviado para ${participant.name}!`);
      fetchData();
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      toast.error(error.message || "Erro ao enviar lembrete");
    } finally {
      setSendingReminderId(null);
    }
  };

  const [allResults, setAllResults] = useState<any[]>([]);

  const handleRowClick = async (participant: Participant) => {
    setSelectedParticipant(participant);
    setSelectedResult(null);
    setAllResults([]);

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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar participantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[180px]">
            <Building2 className="h-4 w-4 mr-2" />
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
          <SelectTrigger className="w-[180px]">
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
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{participants.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-foreground">
            {participants.filter((p) => p.status === "pending").length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Em andamento</p>
          <p className="text-2xl font-bold text-foreground">
            {participants.filter((p) => p.status === "in_progress").length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Concluídos</p>
          <p className="text-2xl font-bold text-foreground">
            {participants.filter((p) => p.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Participant list */}
      <ParticipantList
        participants={filteredParticipants}
        onEdit={(participant) => setEditingParticipant(participant)}
        onDelete={(participant) => setDeletingParticipant(participant)}
        onInvite={handleInviteParticipant}
        onReminder={handleReminderParticipant}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        sendingInviteId={sendingInviteId}
        sendingReminderId={sendingReminderId}
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

      {/* Result sheet - full-width drawer */}
      <Sheet
        open={!!selectedParticipant}
        onOpenChange={(open) => !open && setSelectedParticipant(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto p-6">
          <SheetHeader className="sr-only">
            <SheetTitle>{selectedParticipant?.name}</SheetTitle>
            <SheetDescription>Resultado do diagnóstico</SheetDescription>
          </SheetHeader>

          {selectedParticipant?.status === "completed" ? (
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <Clock className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Diagnóstico ainda não concluído</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Status atual: <StatusBadge status={selectedParticipant?.status as any} />
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
