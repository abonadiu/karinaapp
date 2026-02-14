import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings,
  Building2,
  UserCheck,
  TrendingUp,
  Loader2,
  Shield
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAuditLogs } from "@/components/admin/AdminAuditLogs";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { supabase } from "@/integrations/backend/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Administracao() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const handleNavigateToTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
        navigate("/dashboard");
        return;
      }
      setIsLoading(false);
    }
  }, [authLoading, isAdmin, navigate]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Painel de Administração
            </h1>
            <p className="text-muted-foreground">
              Gerencie a plataforma, usuários e configurações
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview onNavigateToTab={handleNavigateToTab} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="logs">
            <AdminAuditLogs />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
