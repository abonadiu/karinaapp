import { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  UserCheck,
  BarChart3,
  Target,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";

interface PlatformStats {
  total_companies: number;
  total_participants: number;
  total_completed: number;
  total_in_progress: number;
  total_pending: number;
  total_diagnostics: number;
  total_facilitators: number;
  total_managers: number;
  avg_score: number;
  completion_rate: number;
}

export function AdminOverview() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_platform_stats');

        if (error) throw error;
        setStats(data as unknown as PlatformStats);
      } catch (error: any) {
        console.error("Error fetching stats:", error);
        toast.error("Erro ao carregar estatísticas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_companies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total cadastradas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_participants || 0}</div>
            <p className="text-xs text-muted-foreground">
              Em todas as empresas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diagnósticos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_diagnostics || 0}</div>
            <p className="text-xs text-muted-foreground">
              Concluídos
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completion_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              De todos os participantes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facilitadores</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_facilitators || 0}</div>
            <p className="text-xs text-muted-foreground">
              Administradores ativos
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestores</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_managers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Company managers
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Global</CardTitle>
            <Target className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avg_score || 0}</div>
            <p className="text-xs text-muted-foreground">
              Score médio dos diagnósticos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="shadow-warm">
        <CardHeader>
          <CardTitle>Status dos Participantes</CardTitle>
          <CardDescription>Distribuição por status de diagnóstico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_completed || 0}</p>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-950 rounded-lg">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_in_progress || 0}</p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_pending || 0}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
