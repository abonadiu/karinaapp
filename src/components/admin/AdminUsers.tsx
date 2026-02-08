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
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";
import { useImpersonation, ImpersonatedRole } from "@/contexts/ImpersonationContext";

interface UserData {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  created_at: string;
  last_sign_in: string | null;
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { startImpersonation } = useImpersonation();
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
    const role = user.role as ImpersonatedRole;
    
    if (role === "company_manager") {
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
        
        toast.success(`Emulando visão de ${user.full_name || user.email}`);
        navigate("/empresa/portal");
      } else {
        toast.error("Este gestor não está vinculado a nenhuma empresa");
      }
    } else if (role === "facilitator") {
      startImpersonation({
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: "facilitator",
      });
      
      toast.success(`Emulando visão de ${user.full_name || user.email}`);
      navigate("/dashboard");
    } else {
      toast.info("Este usuário não possui um perfil específico para emular");
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'facilitator':
        return (
          <Badge variant="default" className="bg-primary">
            <Shield className="h-3 w-3 mr-1" />
            Facilitador
          </Badge>
        );
      case 'company_manager':
        return (
          <Badge variant="secondary">
            <Building2 className="h-3 w-3 mr-1" />
            Gestor
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Sem role
          </Badge>
        );
    }
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
        <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
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
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Criado em
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Último acesso
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr 
                    key={user.user_id} 
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {(user.full_name || user.email || "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.full_name || "Nome não definido"}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(user.role)}
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
                    <td className="py-3 px-4">
                      <div className="flex justify-end">
                        {user.role && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleImpersonate(user)}
                            className="gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                            Emular
                          </Button>
                        )}
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
    </div>
  );
}
