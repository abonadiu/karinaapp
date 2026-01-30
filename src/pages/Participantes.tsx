import { useState, useEffect } from "react";
import { Search, Building2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ParticipantList } from "@/components/participants/ParticipantList";
import { ParticipantForm, ParticipantFormData } from "@/components/participants/ParticipantForm";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
    </DashboardLayout>
  );
}
