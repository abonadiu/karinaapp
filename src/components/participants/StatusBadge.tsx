import { Badge } from "@/components/ui/badge";

type ParticipantStatus = "pending" | "invited" | "in_progress" | "completed";

interface StatusBadgeProps {
  status: ParticipantStatus;
}

const statusConfig: Record<ParticipantStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  invited: { label: "Convidado", variant: "outline" },
  in_progress: { label: "Em andamento", variant: "default" },
  completed: { label: "Concluído", variant: "default" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <Badge 
      variant={config.variant}
      className={
        status === "completed" 
          ? "bg-success text-success-foreground" 
          : status === "in_progress"
          ? "bg-info text-info-foreground"
          : undefined
      }
    >
      {config.label}
    </Badge>
  );
}
