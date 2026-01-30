import { Link } from "react-router-dom";
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  Plus,
  TrendingUp
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const stats = [
    { label: "Empresas", value: "0", icon: Building2, color: "text-primary" },
    { label: "Participantes", value: "0", icon: Users, color: "text-accent" },
    { label: "Avaliações", value: "0", icon: BarChart3, color: "text-success" },
  ];

  const quickActions = [
    { label: "Adicionar Empresa", icon: Building2, href: "#" },
    { label: "Nova Avaliação", icon: Plus, href: "#" },
    { label: "Ver Relatórios", icon: TrendingUp, href: "#" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg font-serif">IQ</span>
            </div>
            <span className="text-xl font-serif font-semibold text-foreground">IQ+IS</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/perfil">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  {profile?.full_name || user?.email}
                </p>
                <p className="text-xs text-muted-foreground">Facilitador</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
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
          {stats.map((stat) => (
            <Card key={stat.label} className="shadow-warm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
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
      </main>
    </div>
  );
}
