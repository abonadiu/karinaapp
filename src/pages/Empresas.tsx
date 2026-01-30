import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CompanyList } from "@/components/companies/CompanyList";
import { CompanyForm, CompanyFormData } from "@/components/companies/CompanyForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function Empresas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCompanies = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar empresas");
      console.error(error);
    } else {
      setCompanies(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, [user]);

  const handleCreate = async (data: CompanyFormData) => {
    if (!user) return;
    
    setIsSaving(true);
    const { error } = await supabase.from("companies").insert({
      facilitator_id: user.id,
      name: data.name,
      contact_name: data.contact_name || null,
      contact_email: data.contact_email || null,
      contact_phone: data.contact_phone || null,
      total_licenses: data.total_licenses,
      notes: data.notes || null,
    });

    if (error) {
      toast.error("Erro ao criar empresa");
      console.error(error);
    } else {
      toast.success("Empresa criada com sucesso!");
      fetchCompanies();
    }
    setIsSaving(false);
  };

  const handleEdit = async (data: CompanyFormData) => {
    if (!editingCompany) return;
    
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
      .eq("id", editingCompany.id);

    if (error) {
      toast.error("Erro ao atualizar empresa");
      console.error(error);
    } else {
      toast.success("Empresa atualizada com sucesso!");
      fetchCompanies();
    }
    setIsSaving(false);
    setEditingCompany(null);
  };

  const handleDelete = async () => {
    if (!deletingCompany) return;
    
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", deletingCompany.id);

    if (error) {
      toast.error("Erro ao excluir empresa");
      console.error(error);
    } else {
      toast.success("Empresa excluída com sucesso!");
      fetchCompanies();
    }
    setDeletingCompany(null);
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Empresas"
      description="Gerencie as empresas clientes cadastradas"
      actions={
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      }
    >
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Company list */}
      <CompanyList
        companies={filteredCompanies}
        onEdit={(company) => setEditingCompany(company)}
        onDelete={(company) => setDeletingCompany(company)}
        isLoading={isLoading}
      />

      {/* Create form */}
      <CompanyForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreate}
        isLoading={isSaving}
      />

      {/* Edit form */}
      <CompanyForm
        open={!!editingCompany}
        onOpenChange={(open) => !open && setEditingCompany(null)}
        onSubmit={handleEdit}
        defaultValues={editingCompany ? {
          name: editingCompany.name,
          contact_name: editingCompany.contact_name || "",
          contact_email: editingCompany.contact_email || "",
          contact_phone: editingCompany.contact_phone || "",
          total_licenses: editingCompany.total_licenses,
          notes: editingCompany.notes || "",
        } : undefined}
        isEditing
        isLoading={isSaving}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingCompany} onOpenChange={(open) => !open && setDeletingCompany(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa "{deletingCompany?.name}"? 
              Esta ação não pode ser desfeita e todos os participantes associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
