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
  Calendar
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ParticipantList } from "@/components/participants/ParticipantList";
import { ParticipantForm, ParticipantFormData } from "@/components/participants/ParticipantForm";
import { CsvImport } from "@/components/participants/CsvImport";
import { CompanyForm, CompanyFormData } from "@/components/companies/CompanyForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

export default function EmpresaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
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
  }, [id, user]);

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

  const handleInviteParticipant = async (participant: Participant) => {
    const { error } = await supabase
      .from("participants")
      .update({ 
        status: "invited",
        invited_at: new Date().toISOString(),
      })
      .eq("id", participant.id);

    if (error) {
      toast.error("Erro ao enviar convite");
      console.error(error);
    } else {
      toast.success(`Convite enviado para ${participant.name}!`);
      fetchParticipants();
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditCompanyOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
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

      {/* Participants section */}
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
      />

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
