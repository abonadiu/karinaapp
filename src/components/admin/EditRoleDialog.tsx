import { useState, useEffect } from "react";
import { Loader2, Shield } from "lucide-react";
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
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";

type AppRole = "admin" | "facilitator" | "company_manager";

interface UserData {
  user_id: string;
  email: string;
  full_name: string | null;
  roles: string[] | null;
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
  const [isLoading, setIsLoading] = useState(false);

  // Update selected roles when user changes or dialog opens
  useEffect(() => {
    if (user && open) {
      setSelectedRoles(new Set(user.roles || []));
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

    // Check if trying to remove own admin role
    if (user.user_id === currentUserId && currentRoles.has("admin") && !newRoles.has("admin")) {
      toast.error("Você não pode remover sua própria role de administrador");
      return;
    }

    // Find roles to add and remove
    const rolesToAdd = [...newRoles].filter(r => !currentRoles.has(r));
    const rolesToRemove = [...currentRoles].filter(r => !newRoles.has(r));

    // No changes
    if (rolesToAdd.length === 0 && rolesToRemove.length === 0) {
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
