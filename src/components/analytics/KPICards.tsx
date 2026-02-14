import { Users, CheckCircle, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KPICardsProps {
  totalParticipants: number;
  completedParticipants: number;
  completionRate: number;
  averageCompletionDays: number | null;
  isLoading: boolean;
  onCardClick?: (cardId: string) => void;
}

export function KPICards({
  totalParticipants,
  completedParticipants,
  completionRate,
  averageCompletionDays,
  isLoading,
  onCardClick,
}: KPICardsProps) {
  const kpis = [
    {
      id: "total",
      title: "Total de Participantes",
      value: totalParticipants,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: "completed",
      title: "Diagnósticos Concluídos",
      value: completedParticipants,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      id: "completion_rate",
      title: "Taxa de Conclusão",
      value: `${completionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      id: "avg_days",
      title: "Tempo Médio (dias)",
      value: averageCompletionDays !== null ? averageCompletionDays.toFixed(1) : "-",
      icon: Clock,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.title}
          className={`shadow-warm transition-all duration-200 ${onCardClick ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg" : ""}`}
          onClick={() => onCardClick?.(kpi.id)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
