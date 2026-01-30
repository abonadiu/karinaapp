import { useEffect, useState } from "react";
import { Bell, CheckCircle, XCircle, TrendingUp, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface ReminderStats {
  total: number;
  thisWeek: number;
  successful: number;
  failed: number;
  conversionRate: number;
}

interface RecentReminder {
  id: string;
  sent_at: string;
  success: boolean;
  participant_name: string;
}

export function ReminderStatsCard() {
  const [stats, setStats] = useState<ReminderStats>({
    total: 0,
    thisWeek: 0,
    successful: 0,
    failed: 0,
    conversionRate: 0,
  });
  const [recentReminders, setRecentReminders] = useState<RecentReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReminderStats = async () => {
      setIsLoading(true);

      try {
        // Fetch all reminders with participant info
        const { data: reminders, error } = await supabase
          .from("participant_reminders")
          .select(`
            id,
            sent_at,
            success,
            participants!inner (
              id,
              name,
              status,
              facilitator_id
            )
          `)
          .order("sent_at", { ascending: false });

        if (error) {
          console.error("Error fetching reminders:", error);
          return;
        }

        if (!reminders || reminders.length === 0) {
          setIsLoading(false);
          return;
        }

        // Calculate stats
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const total = reminders.length;
        const thisWeek = reminders.filter(r => new Date(r.sent_at) >= oneWeekAgo).length;
        const successful = reminders.filter(r => r.success).length;
        const failed = total - successful;

        // Calculate conversion rate (participants who completed after receiving reminder)
        const remindedParticipantIds = [...new Set(reminders.map(r => r.participants?.id))];
        const completedAfterReminder = reminders.filter(
          r => r.participants?.status === "completed"
        );
        const uniqueCompleted = [...new Set(completedAfterReminder.map(r => r.participants?.id))];
        const conversionRate = remindedParticipantIds.length > 0
          ? (uniqueCompleted.length / remindedParticipantIds.length) * 100
          : 0;

        setStats({
          total,
          thisWeek,
          successful,
          failed,
          conversionRate,
        });

        // Get recent reminders for display
        const recent = reminders.slice(0, 5).map(r => ({
          id: r.id,
          sent_at: r.sent_at,
          success: r.success,
          participant_name: r.participants?.name || "Desconhecido",
        }));

        setRecentReminders(recent);
      } catch (error) {
        console.error("Error calculating reminder stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminderStats();
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-warm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Lembretes Automáticos
          </CardTitle>
          <CardDescription>Carregando estatísticas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Lembretes Automáticos
        </CardTitle>
        <CardDescription>Acompanhe o engajamento dos participantes</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Enviados</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.thisWeek}</p>
            <p className="text-sm text-muted-foreground">Esta Semana</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.conversionRate.toFixed(0)}%</p>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Taxa Conversão
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {stats.total > 0 ? ((stats.successful / stats.total) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-sm text-muted-foreground">Taxa Sucesso</p>
          </div>
        </div>

        {/* Recent Reminders */}
        {recentReminders.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Últimos Lembretes
            </h4>
            <div className="space-y-2">
              {recentReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {reminder.success ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {reminder.participant_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={reminder.success ? "default" : "destructive"} className="text-xs">
                      {reminder.success ? "Enviado" : "Falhou"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reminder.sent_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum lembrete enviado ainda</p>
            <p className="text-xs">Lembretes são enviados automaticamente após 3 dias do convite</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
