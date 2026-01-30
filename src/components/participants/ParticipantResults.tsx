import { TeamStats } from "./TeamStats";
import { ParticipantResultCard } from "./ParticipantResultCard";
import { DimensionScore } from "@/lib/diagnostic-scoring";
import { ClipboardList } from "lucide-react";

interface ParticipantResult {
  participantId: string;
  participantName: string;
  completedAt: string;
  totalScore: number;
  dimensionScores: DimensionScore[];
}

interface ParticipantResultsProps {
  results: ParticipantResult[];
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  isLoading: boolean;
  companyName?: string;
  facilitatorName?: string;
  facilitatorLogoUrl?: string;
  primaryColor?: string;
}

export function ParticipantResults({
  results,
  completedCount,
  inProgressCount,
  pendingCount,
  isLoading,
  companyName,
  facilitatorName,
  facilitatorLogoUrl,
  primaryColor
}: ParticipantResultsProps) {
  // Calculate team averages
  const teamDimensionScores: DimensionScore[] = [];
  const teamAverageScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.totalScore, 0) / results.length
    : 0;

  if (results.length > 0) {
    // Get all unique dimensions
    const dimensions = results[0].dimensionScores.map(s => s.dimension);
    
    dimensions.forEach((dimension, index) => {
      const scores = results
        .map(r => r.dimensionScores.find(s => s.dimension === dimension)?.score)
        .filter((s): s is number => s !== undefined);
      
      const avgScore = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;

      teamDimensionScores.push({
        dimension,
        dimensionOrder: index + 1,
        score: avgScore,
        maxScore: 5,
        percentage: (avgScore / 5) * 100
      });
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Convert results to simpler format for PDF
  const participantResultsForPDF = results.map(r => ({
    name: r.participantName,
    score: r.totalScore,
    completedAt: r.completedAt
  }));

  return (
    <div className="space-y-8">
      {/* Team statistics */}
      <TeamStats
        completedCount={completedCount}
        inProgressCount={inProgressCount}
        pendingCount={pendingCount}
        teamAverageScore={teamAverageScore}
        teamDimensionScores={teamDimensionScores}
        companyName={companyName}
        facilitatorName={facilitatorName}
        facilitatorLogoUrl={facilitatorLogoUrl}
        primaryColor={primaryColor}
        participantResults={participantResultsForPDF}
      />

      {/* Individual results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Resultados Individuais
        </h3>

        {results.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum participante completou o diagnóstico ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Os resultados aparecerão aqui assim que forem concluídos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <ParticipantResultCard
                key={result.participantId}
                participantName={result.participantName}
                completedAt={result.completedAt}
                totalScore={result.totalScore}
                dimensionScores={result.dimensionScores}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
