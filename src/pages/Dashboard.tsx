import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Users, 
  BarChart3, 
  Plus,
  TrendingUp,
  User
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user, profile } = useAuth();
  
  const [stats, setStats] = useState({
    companies: 0,
    participants: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      const [companiesResult, participantsResult] = await Promise.all([
        supabase.from("companies").select("id", { count: "exact" }),
        supabase.from("participants").select("id, status"),
      ]);

      const companies = companiesResult.count || 0;
      const participants = participantsResult.data?.length || 0;
      const completed = participantsResult.data?.filter(p => p.status === "completed").length || 0;

      setStats({ companies, participants, completed });
      setIsLoading(false);
    };

    fetchStats();
  }, [user]);

  const statCards = [
    { label: "Empresas", value: stats.companies, icon: Building2, color: "text-primary", href: "/empresas" },
    { label: "Participantes", value: stats.participants, icon: Users, color: "text-accent", href: "/participantes" },
    { label: "Concluídos", value: stats.completed, icon: BarChart3, color: "text-success", href: "/participantes?status=completed" },
  ];

  const quickActions = [
    { label: "Adicionar Empresa", icon: Building2, href: "/empresas" },
    { label: "Ver Participantes", icon: Users, href: "/participantes" },
    { label: "Ver Relatórios", icon: TrendingUp, href: "#" },
  ];

  return (
    <DashboardLayout>
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
          Olá, {profile?.full_name?.split(" ")[0] || "Facilitador"}!
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de controle. Gerencie empresas e acompanhe avaliações.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="shadow-warm hover:shadow-warm-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {isLoading ? "-" : stat.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <Card className="shadow-warm mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          <CardDescription>Comece a usar a plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                asChild
              >
                <Link to={action.href}>
                  <action.icon className="h-6 w-6 text-primary" />
                  <span>{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile completion prompt */}
      {(!profile?.bio || !profile?.avatar_url) && (
        <Card className="shadow-warm border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Complete seu perfil
            </CardTitle>
            <CardDescription>
              Adicione mais informações para personalizar sua experiência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/perfil">
              <Button>
                Completar perfil
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
