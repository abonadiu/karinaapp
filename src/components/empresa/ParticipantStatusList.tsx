import { useEffect, useState } from "react";
import { X, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/participants/StatusBadge";
import { supabase } from "@/integrations/backend/client";
import { toast } from "sonner";

interface AnonymizedParticipant {
  row_number: number;
  status: string;
  department: string | null;
  completed_at: string | null;
  started_at: string | null;
  invited_at: string | null;
}

interface ParticipantStatusListProps {
  companyId: string;
  filter: string | null;
  onClose: () => void;
}

const filterLabels: Record<string, string> = {
  completed: "Concluídos",
  in_progress: "Em Andamento",
  pending: "Pendentes",
};

export function ParticipantStatusList({ 
  companyId, 
  filter, 
  onClose 
}: ParticipantStatusListProps) {
  const [participants, setParticipants] = useState<AnonymizedParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc(
          "get_company_participants_anonymized",
          { 
            p_company_id: companyId,
            p_status: filter
          }
        );

        if (error) throw error;
        setParticipants((data as AnonymizedParticipant[]) || []);
      } catch (error: any) {
        console.error("Error fetching anonymized participants:", error);
        toast.error("Erro ao carregar lista de colaboradores");
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [companyId, filter]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRelevantDate = (participant: AnonymizedParticipant) => {
    if (participant.status === "completed") {
      return { label: "Concluído em", date: participant.completed_at };
    }
    if (participant.status === "in_progress") {
      return { label: "Iniciado em", date: participant.started_at };
    }
    return { label: "Convidado em", date: participant.invited_at };
  };

  const title = filter 
    ? `Colaboradores: ${filterLabels[filter] || filter} (${participants.length})`
    : `Todos os Colaboradores (${participants.length})`;

  return (
    <Card className="shadow-warm animate-in slide-in-from-top-2 duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : participants.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum colaborador encontrado
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {participants.map((participant) => {
              const dateInfo = getRelevantDate(participant);
              return (
                <div 
                  key={participant.row_number}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">
                      Colaborador {participant.row_number}
                    </span>
                    {participant.department && (
                      <span className="text-sm text-muted-foreground">
                        • {participant.department}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <span className="hidden sm:inline">{dateInfo.label}: </span>
                      {formatDate(dateInfo.date)}
                    </div>
                    <StatusBadge status={participant.status as any} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
