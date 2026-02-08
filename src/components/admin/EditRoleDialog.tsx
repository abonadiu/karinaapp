import { useState, useEffect } from "react";
import { Loader2, Shield, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";

type AppRole = "admin" | "facilitator" | "company_manager" | "participant";

interface Company {
  id: string;
  name: string;
}

interface UserData {
  user_id: string;
  email: string;
  full_name: string | null;
  roles: string[] | null;
  company_id: string | null;
  company_name: string | null;
  participant_id: string | null;
}

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  currentUserId: string;
  onSuccess: () => void;
}

export function EditRoleDialog({ 
  open, 
  onOpenChange, 
  user, 
  currentUserId,
  onSuccess 
}: EditRoleDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Load companies list
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("id, name")
          .order("name");
        
        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    if (open) {
      fetchCompanies();
    }
  }, [open]);

  // Update selected roles and company when user changes or dialog opens
  useEffect(() => {
    if (user && open) {
      setSelectedRoles(new Set(user.roles || []));
      setSelectedCompanyId(user.company_id);
    }
  }, [user, open]);

  const handleRoleToggle = (role: string) => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(role)) {
      newRoles.delete(role);
    } else {
      newRoles.add(role);
    }
    setSelectedRoles(newRoles);
  };

  const handleSave = async () => {
    if (!user) return;

    const currentRoles = new Set(user.roles || []);
    const newRoles = selectedRoles;
    const hasCompanyManager = newRoles.has("company_manager");
    const hadCompanyManager = currentRoles.has("company_manager");
    const hasParticipant = newRoles.has("participant");
    const hadParticipant = currentRoles.has("participant");

    // Check if trying to remove own admin role
    if (user.user_id === currentUserId && currentRoles.has("admin") && !newRoles.has("admin")) {
      toast.error("Você não pode remover sua própria role de administrador");
      return;
    }

    // Validate company selection when company_manager is selected
    if (hasCompanyManager && !selectedCompanyId) {
      toast.error("Selecione uma empresa para vincular o gestor");
      return;
    }

    // Validate company selection when participant is selected
    if (hasParticipant && !selectedCompanyId) {
      toast.error("Selecione uma empresa para vincular o participante");
      return;
    }

    // Find roles to add and remove
    const rolesToAdd = [...newRoles].filter(r => !currentRoles.has(r));
    const rolesToRemove = [...currentRoles].filter(r => !newRoles.has(r));

    // Check if company changed
    const companyChanged = selectedCompanyId !== user.company_id;

    // No changes
    if (rolesToAdd.length === 0 && rolesToRemove.length === 0 && !companyChanged) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      // Remove old roles
      for (const role of rolesToRemove) {
        const { error } = await supabase.rpc("admin_remove_user_role", {
          p_user_id: user.user_id,
          p_role: role as AppRole,
        });
        if (error) throw new Error(error.message);
      }

      // Add new roles
      for (const role of rolesToAdd) {
        const { error } = await supabase.rpc("admin_set_user_role", {
          p_user_id: user.user_id,
          p_role: role as AppRole,
        });
        if (error) throw new Error(error.message);
      }

      // Handle company_manager linking/unlinking
      if (hasCompanyManager && selectedCompanyId && companyChanged) {
        const { error } = await supabase.rpc("admin_link_user_to_company", {
          p_user_id: user.user_id,
          p_company_id: selectedCompanyId,
          p_name: user.full_name || user.email,
          p_email: user.email,
        });
        if (error) throw new Error(error.message);
      } else if (!hasCompanyManager && hadCompanyManager && user.company_id) {
        const { error } = await supabase.rpc("admin_unlink_user_from_company", {
          p_user_id: user.user_id,
        });
        if (error) throw new Error(error.message);
      }

      // Handle participant linking/unlinking
      if (hasParticipant && selectedCompanyId && (companyChanged || !hadParticipant)) {
        const { error } = await supabase.rpc("admin_link_participant_to_company", {
          p_user_id: user.user_id,
          p_company_id: selectedCompanyId,
          p_name: user.full_name || user.email,
          p_email: user.email,
        });
        if (error) throw new Error(error.message);
      } else if (!hasParticipant && hadParticipant) {
        const { error } = await supabase.rpc("admin_unlink_participant_from_company", {
          p_user_id: user.user_id,
        });
        if (error) throw new Error(error.message);
      }

      toast.success("Roles atualizadas com sucesso!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating roles:", error);
      toast.error(error.message || "Erro ao atualizar roles");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const isSelf = user.user_id === currentUserId;
  const isSelfAdmin = isSelf && (user.roles || []).includes("admin");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Editar Roles
          </DialogTitle>
          <DialogDescription>
            Gerencie as roles de acesso do usuário. Um usuário pode ter múltiplas roles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Usuário</Label>
            <p className="font-medium">{user.full_name || user.email}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-3">
            <Label>Roles de acesso</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="admin"
                  checked={selectedRoles.has("admin")}
                  onCheckedChange={() => handleRoleToggle("admin")}
                  disabled={isSelfAdmin}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="admin"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Administrador
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Acesso total: gestão de usuários, configurações globais, logs de auditoria
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="facilitator"
                  checked={selectedRoles.has("facilitator")}
                  onCheckedChange={() => handleRoleToggle("facilitator")}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="facilitator"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Facilitador
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Coach/Consultor: gerencia empresas e aplica diagnósticos
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="company_manager"
                  checked={selectedRoles.has("company_manager")}
                  onCheckedChange={() => handleRoleToggle("company_manager")}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="company_manager"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Gestor de Empresa
                  </label>
                  <p className="text-xs text-muted-foreground">
                    RH/Gestor: visualiza dados agregados da sua empresa
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="participant"
                  checked={selectedRoles.has("participant")}
                  onCheckedChange={() => handleRoleToggle("participant")}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="participant"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Participante
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Acesso ao diagnóstico e portal de resultados
                  </p>
                </div>
              </div>

              {/* Company selection - shown when company_manager or participant is selected */}
              {(selectedRoles.has("company_manager") || selectedRoles.has("participant")) && (
                <div className="mt-4 p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <Label>Empresa vinculada</Label>
                  </div>
                  <Select
                    value={selectedCompanyId || ""}
                    onValueChange={(value) => setSelectedCompanyId(value || null)}
                    disabled={isLoadingCompanies}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isLoadingCompanies ? "Carregando..." : "Selecione uma empresa"} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedCompanyId && (
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ Selecione uma empresa para vincular o {selectedRoles.has("company_manager") ? "gestor" : "participante"}
                    </p>
                  )}
                </div>
              )}
            </div>

            {isSelfAdmin && (
              <p className="text-xs text-muted-foreground">
                Você não pode remover sua própria role de administrador.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
