import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, User, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";

export interface FeedbackSession {
  id: string;
  status: string;
  scheduled_at: string | null;
  event_name: string | null;
  created_at: string;
  participant: {
    id: string;
    name: string;
    email: string;
    company: {
      id: string;
      name: string;
    } | null;
  } | null;
}

interface FeedbackSessionsTableProps {
  sessions: FeedbackSession[];
  isLoading: boolean;
  onRefresh: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Agendada", icon: Clock, variant: "secondary" },
  completed: { label: "Realizada", icon: CheckCircle, variant: "default" },
  cancelled: { label: "Cancelada", icon: XCircle, variant: "destructive" },
  no_show: { label: "Não compareceu", icon: AlertCircle, variant: "outline" },
};

export function FeedbackSessionsTable({ sessions, isLoading, onRefresh }: FeedbackSessionsTableProps) {
  const handleMarkAsCompleted = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("feedback_sessions")
        .update({ status: "completed" })
        .eq("id", sessionId);

      if (error) throw error;
      toast.success("Sessão marcada como realizada!");
      onRefresh();
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Erro ao atualizar sessão");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não definida";
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const isPastSession = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (isLoading) {
    return (
      <Card className="shadow-warm">
        <CardHeader>
          <CardTitle>Sessões de Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="shadow-warm">
        <CardHeader>
          <CardTitle>Sessões de Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma sessão de feedback registrada</p>
            <p className="text-sm mt-2">
              As sessões aparecem aqui quando agendadas via Calendly
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle>Sessões de Feedback</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Participante
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Empresa
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Data/Hora
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const config = STATUS_CONFIG[session.status] || STATUS_CONFIG.scheduled;
                const StatusIcon = config.icon;
                const canMarkCompleted = session.status === "scheduled" && isPastSession(session.scheduled_at);

                return (
                  <tr
                    key={session.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {session.participant?.name || "Participante removido"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session.participant?.email || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{session.participant?.company?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(session.scheduled_at)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {canMarkCompleted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsCompleted(session.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marcar Realizada
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
