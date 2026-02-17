import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Building2,
  Mail,
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  Eye,
  UserPlus,
  Pencil,
  Crown,
  Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { useImpersonation, ImpersonatedRole } from "@/contexts/ImpersonationContext";
import { useAuth } from "@/contexts/AuthContext";
import { CreateUserDialog } from "./CreateUserDialog";
import { EditRoleDialog } from "./EditRoleDialog";

interface UserData {
  user_id: string;
  email: string;
  full_name: string | null;
  roles: string[] | null;
  created_at: string;
  last_sign_in: string | null;
  company_id: string | null;
  company_name: string | null;
  participant_id: string | null;
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { startImpersonation } = useImpersonation();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_users');

      if (error) throw error;
      setUsers((data as unknown as UserData[]) || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleImpersonate = async (user: UserData) => {
    const roles = user.roles || [];

    if (roles.includes("company_manager")) {
      // Get the company for this manager
      const { data: companyId } = await supabase.rpc("get_manager_company_id", {
        _user_id: user.user_id,
      });

      if (companyId) {
        // Get company name
        const { data: company } = await supabase
          .from("companies")
          .select("name")
          .eq("id", companyId)
          .single();

        startImpersonation({
          userId: user.user_id,
          email: user.email,
          fullName: user.full_name,
          role: "company_manager",
          companyId,
          companyName: company?.name || "Empresa",
        });

        toast.success(`Emulando visão de ${user.full_name || user.email} `);
        navigate("/empresa/portal");
      } else {
        toast.error("Este gestor não está vinculado a nenhuma empresa");
      }
    } else if (roles.includes("facilitator")) {
      startImpersonation({
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: "facilitator",
      });

      toast.success(`Emulando visão de ${user.full_name || user.email} `);
      navigate("/dashboard");
    } else if (roles.includes("admin")) {
      startImpersonation({
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: "admin",
      });

      toast.success(`Emulando visão de ${user.full_name || user.email} `);
      navigate("/admin");
    } else if (roles.includes("participant")) {
      // Buscar dados do participante
      const { data: participant } = await supabase
        .from("participants")
        .select("id, company_id, companies(name)")
        .eq("user_id", user.user_id)
        .single();

      if (participant) {
        const companyData = participant.companies as { name: string } | null;
        startImpersonation({
          userId: user.user_id,
          email: user.email,
          fullName: user.full_name,
          role: "participant",
          companyId: participant.company_id,
          companyName: companyData?.name || "Empresa",
          participantToken: participant.id,
        });

        toast.success(`Emulando visão de ${user.full_name || user.email} `);
        navigate("/participante/portal");
      } else {
        toast.error("Este participante não possui dados vinculados");
      }
    } else {
      toast.info("Este usuário não possui um perfil específico para emular");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      // Remove roles from the user
      const roles = selectedUser.roles || [];
      for (const role of roles) {
        await supabase.rpc('admin_remove_user_role', {
          p_user_id: selectedUser.user_id,
          p_role: role as any,
        });
      }

      toast.success("Roles do usuário removidas com sucesso");
      toast.info("Para excluir completamente o usuário do sistema, acesse o painel de administração.");
      fetchUsers();
    } catch (error: any) {
      console.error("Error removing user roles:", error);
      toast.error(error.message || "Erro ao remover roles do usuário");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const getRoleBadges = (user: UserData) => {
    const roles = user.roles;
    if (!roles || roles.length === 0) {
      return (
        <Badge variant="outline">
          Sem role
        </Badge>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {roles.includes('admin') && (
          <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )}
        {roles.includes('facilitator') && (
          <Badge variant="default" className="bg-primary">
            <Shield className="h-3 w-3 mr-1" />
            Facilitador
          </Badge>
        )}
        {roles.includes('company_manager') && (
          <Badge variant="secondary">
            <Building2 className="h-3 w-3 mr-1" />
            Gestor
            {user.company_name && !roles.includes('participant') && (
              <span className="ml-1 text-muted-foreground">• {user.company_name}</span>
            )}
          </Badge>
        )}
        {roles.includes('participant') && (
          <Badge variant="outline" className="border-green-600 text-green-600">
            <Users className="h-3 w-3 mr-1" />
            Participante
            {user.company_name && (
              <span className="ml-1 text-muted-foreground">• {user.company_name}</span>
            )}
          </Badge>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const hasEmulableRole = (roles: string[] | null) => {
    if (!roles || roles.length === 0) return false;
    return roles.some(r => ['admin', 'facilitator', 'company_manager', 'participant'].includes(r));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Usuários da Plataforma</h2>
          <p className="text-sm text-muted-foreground">
            {users.length} usuário(s) cadastrado(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
            <RefreshCw className={`h - 4 w - 4 mr - 2 ${isLoading ? 'animate-spin' : ''} `} />
            Atualizar
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="shadow-warm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Usuário
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Roles
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Criado em
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Último acesso
                  </th>

                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.user_id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex items-center gap-3 cursor-pointer">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-medium">
                                {(user.full_name || user.email || "?").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground hover:text-primary transition-colors">
                                {user.full_name || "Nome não definido"}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {hasEmulableRole(user.roles) && (
                            <>
                              <DropdownMenuItem onClick={() => handleImpersonate(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Emular
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setEditRoleDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar Roles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={user.user_id === currentUser?.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Usuário
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadges(user)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(user.last_sign_in)}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {users.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum usuário encontrado
        </div>
      )}

      {/* Dialogs */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchUsers}
      />

      <EditRoleDialog
        open={editRoleDialogOpen}
        onOpenChange={setEditRoleDialogOpen}
        user={selectedUser}
        currentUserId={currentUser?.id || ""}
        onSuccess={fetchUsers}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário
              {selectedUser?.full_name ? ` "${selectedUser.full_name}"` : ""} e todos os dados associados a ele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteUser();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Sim, excluir usuário"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
