import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Minus, TrendingDown } from "lucide-react";

interface PercentilePositionCardProps {
  percentile: number | null;
  totalCompanies?: number;
}

function getPercentileColor(percentile: number): string {
  if (percentile >= 75) return "text-green-500";
  if (percentile >= 50) return "text-blue-500";
  if (percentile >= 25) return "text-amber-500";
  return "text-orange-500";
}

function getPercentileLabel(percentile: number): string {
  if (percentile >= 75) return "Excelente";
  if (percentile >= 50) return "Acima da média";
  if (percentile >= 25) return "Na média";
  return "Abaixo da média";
}

function getPercentileIcon(percentile: number) {
  if (percentile >= 75) return Trophy;
  if (percentile >= 50) return TrendingUp;
  if (percentile >= 25) return Minus;
  return TrendingDown;
}

function getPercentileBgColor(percentile: number): string {
  if (percentile >= 75) return "bg-green-500";
  if (percentile >= 50) return "bg-blue-500";
  if (percentile >= 25) return "bg-amber-500";
  return "bg-orange-500";
}

export function PercentilePositionCard({ percentile, totalCompanies }: PercentilePositionCardProps) {
  if (percentile === null) {
    return (
      <Card className="shadow-warm h-full">
        <CardHeader>
          <CardTitle className="text-lg">Posicionamento</CardTitle>
          <CardDescription>Comparação com outras equipes</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground text-center">
            Aguardando diagnósticos concluídos
          </p>
        </CardContent>
      </Card>
    );
  }

  const Icon = getPercentileIcon(percentile);
  const colorClass = getPercentileColor(percentile);
  const bgColorClass = getPercentileBgColor(percentile);
  const label = getPercentileLabel(percentile);

  return (
    <Card className="shadow-warm h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colorClass}`} />
          Posicionamento
        </CardTitle>
        <CardDescription>Comparação com outras equipes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main percentile display */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-2">
            Sua equipe está melhor que
          </p>
          <div className={`text-5xl font-bold ${colorClass}`}>
            {percentile}%
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            das outras equipes avaliadas
          </p>
        </div>

        {/* Quartile bar */}
        <div className="space-y-2">
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            {/* Quartile segments */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-orange-500/30 border-r border-background" />
              <div className="flex-1 bg-amber-500/30 border-r border-background" />
              <div className="flex-1 bg-blue-500/30 border-r border-background" />
              <div className="flex-1 bg-green-500/30" />
            </div>
            {/* Position indicator */}
            <div
              className={`absolute top-0 bottom-0 w-1 ${bgColorClass} rounded-full shadow-md transition-all`}
              style={{ left: `calc(${percentile}% - 2px)` }}
            />
          </div>
          {/* Quartile labels */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Label */}
        <div className={`text-center py-2 px-4 rounded-lg ${colorClass} bg-current/10`}>
          <span className={`font-medium ${colorClass}`}>{label}</span>
        </div>

        {totalCompanies && totalCompanies > 1 && (
          <p className="text-sm text-center text-muted-foreground">
            Baseado em {totalCompanies} equipes avaliadas
          </p>
        )}
      </CardContent>
    </Card>
  );
}
