import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";

type AppRole = "facilitator" | "company_manager";

interface UserData {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string | null;
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
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || "none");
  const [isLoading, setIsLoading] = useState(false);

  // Update selected role when user changes
  useState(() => {
    if (user) {
      setSelectedRole(user.role || "none");
    }
  });

  const handleSave = async () => {
    if (!user) return;

    const currentRole = user.role;
    const newRole = selectedRole === "none" ? null : selectedRole;

    // Check if trying to remove own facilitator role
    if (user.user_id === currentUserId && currentRole === "facilitator" && newRole !== "facilitator") {
      toast.error("Você não pode remover sua própria role de facilitador");
      return;
    }

    // No changes
    if (currentRole === newRole || (currentRole === null && newRole === null)) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      // Remove old role if exists
      if (currentRole) {
        const { error: removeError } = await supabase.rpc("admin_remove_user_role", {
          p_user_id: user.user_id,
          p_role: currentRole as AppRole,
        });

        if (removeError) {
          throw new Error(removeError.message);
        }
      }

      // Add new role if selected
      if (newRole) {
        const { error: addError } = await supabase.rpc("admin_set_user_role", {
          p_user_id: user.user_id,
          p_role: newRole as AppRole,
        });

        if (addError) {
          throw new Error(addError.message);
        }
      }

      toast.success("Perfil atualizado com sucesso!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const isSelf = user.user_id === currentUserId;
  const isSelfFacilitator = isSelf && user.role === "facilitator";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Editar Perfil de Acesso
          </DialogTitle>
          <DialogDescription>
            Altere o perfil de acesso do usuário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Usuário</Label>
            <p className="font-medium">{user.full_name || user.email}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Perfil de acesso</Label>
            <Select 
              value={selectedRole} 
              onValueChange={setSelectedRole}
              disabled={isSelfFacilitator}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione um perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem perfil específico</SelectItem>
                <SelectItem value="facilitator">Facilitador (Admin)</SelectItem>
                <SelectItem value="company_manager">Gestor de Empresa</SelectItem>
              </SelectContent>
            </Select>
            {isSelfFacilitator && (
              <p className="text-xs text-muted-foreground">
                Você não pode alterar sua própria role de facilitador.
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
            disabled={isLoading || isSelfFacilitator}
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
