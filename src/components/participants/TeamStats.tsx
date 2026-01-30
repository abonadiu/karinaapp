import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsRadarChart } from "@/components/diagnostic/ResultsRadarChart";
import { DimensionScore } from "@/lib/diagnostic-scoring";
import { Users, Target, TrendingUp, TrendingDown } from "lucide-react";

interface TeamStatsProps {
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  teamAverageScore: number;
  teamDimensionScores: DimensionScore[];
}

export function TeamStats({
  completedCount,
  inProgressCount,
  pendingCount,
  teamAverageScore,
  teamDimensionScores
}: TeamStatsProps) {
  // Find strongest and weakest dimensions
  const sortedScores = [...teamDimensionScores].sort((a, b) => b.score - a.score);
  const strongest = sortedScores[0];
  const weakest = sortedScores[sortedScores.length - 1];

  const hasData = completedCount > 0 && teamDimensionScores.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">{completedCount}</p>
            <p className="text-xs text-muted-foreground">
              {inProgressCount > 0 && `${inProgressCount} em andamento`}
              {inProgressCount > 0 && pendingCount > 0 && " • "}
              {pendingCount > 0 && `${pendingCount} pendentes`}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Média Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <>
                <p className="text-3xl font-bold text-primary">
                  {teamAverageScore.toFixed(1)}
                  <span className="text-lg text-muted-foreground">/5</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {((teamAverageScore / 5) * 100).toFixed(0)}% do máximo
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Destaques da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hasData && strongest && weakest ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Forte:</span>
                  <span className="font-medium truncate">{strongest.dimension.split(" ")[0]}</span>
                  <span className="text-success font-bold ml-auto">{strongest.score.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">Desenvolver:</span>
                  <span className="font-medium truncate">{weakest.dimension.split(" ")[0]}</span>
                  <span className="text-orange-500 font-bold ml-auto">{weakest.score.toFixed(1)}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Sem dados ainda</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team radar chart */}
      {hasData && (
        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle className="text-base">Perfil da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsRadarChart scores={teamDimensionScores} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
