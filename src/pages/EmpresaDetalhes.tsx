import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  Plus, 
  Upload,
  Pencil,
  Calendar,
  Send,
  UserPlus
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ParticipantList } from "@/components/participants/ParticipantList";
import { ParticipantForm, ParticipantFormData } from "@/components/participants/ParticipantForm";
import { CsvImport } from "@/components/participants/CsvImport";
import { CompanyForm, CompanyFormData } from "@/components/companies/CompanyForm";
import { BulkInviteDialog } from "@/components/participants/BulkInviteDialog";
import { ParticipantResults } from "@/components/participants/ParticipantResults";
import { InviteManagerDialog } from "@/components/empresa/InviteManagerDialog";
import { SelfRegisterLinkDialog } from "@/components/participants/SelfRegisterLinkDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { supabase } from "@/integrations/backend/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DimensionScore } from "@/lib/diagnostic-scoring";
import { Json } from "@/integrations/supabase/types";

type ParticipantStatus = "pending" | "invited" | "in_progress" | "completed";

interface Company {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  total_licenses: number;
  used_licenses: number;
  notes: string | null;
  created_at: string;
  self_register_token?: string;
}

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
}

interface DiagnosticResult {
  id: string;
  participant_id: string;
  total_score: number;
  dimension_scores: Json;
  completed_at: string;
}

interface ParticipantResultData {
  participantId: string;
  participantName: string;
  completedAt: string;
  totalScore: number;
  dimensionScores: DimensionScore[];
}

export default function EmpresaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [results, setResults] = useState<ParticipantResultData[]>([]);
  const [facilitatorProfile, setFacilitatorProfile] = useState<{
    full_name: string | null;
    logo_url: string | null;
    primary_color: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isBulkInviteOpen, setIsBulkInviteOpen] = useState(false);
  const [isInviteManagerOpen, setIsInviteManagerOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [deletingParticipant, setDeletingParticipant] = useState<Participant | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCompany = async () => {
    if (!id || !user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Erro ao carregar empresa");
      console.error(error);
    } else {
      setCompany(data);
    }
    setIsLoading(false);
  };

  const fetchFacilitatorProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("full_name, logo_url, primary_color")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setFacilitatorProfile(data);
    }
  };

  const fetchParticipants = async () => {
    if (!id || !user) return;

    setIsLoadingParticipants(true);
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("company_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar participantes");
      console.error(error);
    } else {
      setParticipants((data || []) as Participant[]);
    }
    setIsLoadingParticipants(false);
  };

  const fetchResults = async () => {
    if (!id || !user || participants.length === 0) {
      setIsLoadingResults(false);
      return;
    }

    setIsLoadingResults(true);
    const participantIds = participants.map(p => p.id);
    
    const { data, error } = await supabase
      .from("diagnostic_results")
      .select("*")
      .in("participant_id", participantIds);

    if (error) {
      toast.error("Erro ao carregar resultados");
      console.error(error);
    } else if (data) {
      // Map results to participant names
      const mappedResults: ParticipantResultData[] = (data as DiagnosticResult[]).map(result => {
        const participant = participants.find(p => p.id === result.participant_id);
        const dimScores = result.dimension_scores as Record<string, number>;
        
        const dimensionScores: DimensionScore[] = Object.entries(dimScores).map(
          ([dimension, score], index) => ({
            dimension,
            dimensionOrder: index + 1,
            score: score as number,
            maxScore: 5,
            percentage: ((score as number) / 5) * 100
          })
        );

        return {
          participantId: result.participant_id,
          participantName: participant?.name || "Participante",
          completedAt: result.completed_at,
          totalScore: result.total_score,
          dimensionScores
        };
      });

      setResults(mappedResults);
    }
    setIsLoadingResults(false);
  };

  const updateUsedLicenses = async (count: number) => {
    if (!id) return;
    
    await supabase
      .from("companies")
      .update({ used_licenses: count })
      .eq("id", id);
    
    fetchCompany();
  };

  useEffect(() => {
    fetchCompany();
    fetchParticipants();
    fetchFacilitatorProfile();
  }, [id, user]);

  // Fetch results when participants are loaded
  useEffect(() => {
    if (participants.length > 0) {
      fetchResults();
    }
  }, [participants]);

  const handleCreateParticipant = async (data: ParticipantFormData) => {
    if (!user || !id) return;

    setIsSaving(true);
    const { error } = await supabase.from("participants").insert({
      company_id: id,
      facilitator_id: user.id,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      department: data.department || null,
      position: data.position || null,
    });

    if (error) {
      toast.error("Erro ao adicionar participante");
      console.error(error);
    } else {
      toast.success("Participante adicionado!");
      fetchParticipants();
      updateUsedLicenses(participants.length + 1);
    }
    setIsSaving(false);
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
      fetchParticipants();
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
      fetchParticipants();
      updateUsedLicenses(participants.length - 1);
    }
    setDeletingParticipant(null);
  };

  const [sendingInviteId, setSendingInviteId] = useState<string | null>(null);

  const handleInviteParticipant = async (participant: Participant) => {
    setSendingInviteId(participant.id);
    
    try {
      // 1. Try to get the most recent participant_test token
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

      // 2. Build diagnostic URL
      const diagnosticUrl = `${window.location.origin}/diagnostico/${accessToken}`;

      // 3. Call edge function to send email with facilitator branding
      const { error: invokeError } = await supabase.functions.invoke("send-invite", {
        body: {
          participantName: participant.name,
          participantEmail: participant.email,
          diagnosticUrl,
          facilitatorId: user?.id,
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
      fetchParticipants();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast.error(error.message || "Erro ao enviar convite");
    } finally {
      setSendingInviteId(null);
    }
  };

  const handleCsvImport = async (importedParticipants: { name: string; email: string; phone?: string; department?: string; position?: string }[]) => {
    if (!user || !id) return;

    setIsSaving(true);
    const { error } = await supabase.from("participants").insert(
      importedParticipants.map((p) => ({
        company_id: id,
        facilitator_id: user.id,
        name: p.name,
        email: p.email,
        phone: p.phone || null,
        department: p.department || null,
        position: p.position || null,
      }))
    );

    if (error) {
      toast.error("Erro ao importar participantes");
      console.error(error);
    } else {
      toast.success(`${importedParticipants.length} participantes importados!`);
      fetchParticipants();
      updateUsedLicenses(participants.length + importedParticipants.length);
    }
    setIsSaving(false);
  };

  const handleEditCompany = async (data: CompanyFormData) => {
    if (!id) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("companies")
      .update({
        name: data.name,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        total_licenses: data.total_licenses,
        notes: data.notes || null,
      })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar empresa");
      console.error(error);
    } else {
      toast.success("Empresa atualizada!");
      fetchCompany();
    }
    setIsSaving(false);
    setIsEditCompanyOpen(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Carregando...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout title="Empresa não encontrada">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Esta empresa não existe ou você não tem acesso.</p>
          <Link to="/empresas">
            <Button>Voltar para empresas</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const usagePercent = company.total_licenses > 0
    ? Math.round((company.used_licenses / company.total_licenses) * 100)
    : 0;

  return (
    <DashboardLayout
      title={company.name}
      description="Detalhes da empresa e participantes"
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {(company as any).self_register_token && (
            <SelfRegisterLinkDialog
              selfRegisterToken={(company as any).self_register_token}
              companyName={company.name}
            />
          )}
          <Button variant="outline" onClick={() => setIsInviteManagerOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar Gestor
          </Button>
          <Button variant="outline" onClick={() => setIsEditCompanyOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline" onClick={() => setIsBulkInviteOpen(true)}>
            <Send className="mr-2 h-4 w-4" />
            Enviar Convites
          </Button>
          <Button variant="outline" onClick={() => setIsCsvOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar CSV
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Participante
          </Button>
        </div>
      }
    >
      {/* Back link */}
      <Link 
        to="/empresas" 
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para empresas
      </Link>

      {/* Company info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.contact_name && (
              <p className="font-medium text-foreground">{company.contact_name}</p>
            )}
            {company.contact_email && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {company.contact_email}
              </p>
            )}
            {company.contact_phone && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {company.contact_phone}
              </p>
            )}
            {!company.contact_name && !company.contact_email && !company.contact_phone && (
              <p className="text-sm text-muted-foreground">Nenhum contato cadastrado</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Licenças
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{company.used_licenses}</span>
              <span className="text-muted-foreground">/ {company.total_licenses}</span>
            </div>
            <Progress value={usagePercent} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{usagePercent}% utilizado</p>
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Cadastro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              {new Date(company.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {company.notes && (
        <Card className="shadow-warm mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{company.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Participants and Results */}
      <Tabs defaultValue="participants" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="participants">
            Participantes ({participants.length})
          </TabsTrigger>
          <TabsTrigger value="results">
            Resultados ({results.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Participantes</h2>
            <p className="text-sm text-muted-foreground">
              {participants.length} participante{participants.length !== 1 ? "s" : ""} cadastrado{participants.length !== 1 ? "s" : ""}
            </p>
          </div>

          <ParticipantList
            participants={participants}
            onEdit={(participant) => setEditingParticipant(participant)}
            onDelete={(participant) => setDeletingParticipant(participant)}
            onInvite={handleInviteParticipant}
            isLoading={isLoadingParticipants}
            sendingInviteId={sendingInviteId}
          />
        </TabsContent>

        <TabsContent value="results">
          <ParticipantResults
            results={results}
            completedCount={participants.filter(p => p.status === "completed").length}
            inProgressCount={participants.filter(p => p.status === "in_progress").length}
            pendingCount={participants.filter(p => p.status === "pending" || p.status === "invited").length}
            isLoading={isLoadingResults}
            companyName={company?.name}
            facilitatorName={facilitatorProfile?.full_name || undefined}
            facilitatorLogoUrl={facilitatorProfile?.logo_url || undefined}
            primaryColor={facilitatorProfile?.primary_color || undefined}
          />
        </TabsContent>
      </Tabs>

      {/* Create participant form */}
      <ParticipantForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateParticipant}
        isLoading={isSaving}
      />

      {/* Edit participant form */}
      <ParticipantForm
        open={!!editingParticipant}
        onOpenChange={(open) => !open && setEditingParticipant(null)}
        onSubmit={handleEditParticipant}
        defaultValues={editingParticipant ? {
          name: editingParticipant.name,
          email: editingParticipant.email,
          phone: editingParticipant.phone || "",
          department: editingParticipant.department || "",
          position: editingParticipant.position || "",
        } : undefined}
        isEditing
        isLoading={isSaving}
      />

      {/* CSV import */}
      <CsvImport
        open={isCsvOpen}
        onOpenChange={setIsCsvOpen}
        onImport={handleCsvImport}
        isLoading={isSaving}
      />

      {/* Edit company form */}
      <CompanyForm
        open={isEditCompanyOpen}
        onOpenChange={setIsEditCompanyOpen}
        onSubmit={handleEditCompany}
        defaultValues={{
          name: company.name,
          contact_name: company.contact_name || "",
          contact_email: company.contact_email || "",
          contact_phone: company.contact_phone || "",
          total_licenses: company.total_licenses,
          notes: company.notes || "",
        }}
        isEditing
        isLoading={isSaving}
      />

      {/* Bulk invite dialog */}
      <BulkInviteDialog
        open={isBulkInviteOpen}
        onOpenChange={setIsBulkInviteOpen}
        participants={participants}
        facilitatorId={user?.id}
        onComplete={fetchParticipants}
      />

      {/* Invite Manager dialog */}
      {company && user && (
        <InviteManagerDialog
          open={isInviteManagerOpen}
          onOpenChange={setIsInviteManagerOpen}
          companyId={company.id}
          companyName={company.name}
          facilitatorId={user.id}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingParticipant} onOpenChange={(open) => !open && setDeletingParticipant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir participante?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deletingParticipant?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteParticipant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
