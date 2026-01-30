import { Question } from "./diagnostic-questions";

export interface DimensionScore {
  dimension: string;
  dimensionOrder: number;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface DiagnosticScores {
  dimensionScores: DimensionScore[];
  totalScore: number;
  totalPercentage: number;
}

export interface ResponseData {
  questionId: string;
  score: number;
}

export function calculateScores(
  questions: Question[],
  responses: Map<string, number>
): DiagnosticScores {
  // Agrupar perguntas por dimensão
  const dimensionGroups = new Map<string, Question[]>();
  
  questions.forEach(q => {
    const existing = dimensionGroups.get(q.dimension) || [];
    existing.push(q);
    dimensionGroups.set(q.dimension, existing);
  });

  const dimensionScores: DimensionScore[] = [];
  
  dimensionGroups.forEach((dimQuestions, dimension) => {
    let totalScore = 0;
    let answeredCount = 0;
    
    dimQuestions.forEach(q => {
      const response = responses.get(q.id);
      if (response !== undefined) {
        // Inverter score se reverse_scored
        const adjustedScore = q.reverse_scored ? (6 - response) : response;
        totalScore += adjustedScore;
        answeredCount++;
      }
    });
    
    const avgScore = answeredCount > 0 ? totalScore / answeredCount : 0;
    const dimensionOrder = dimQuestions[0]?.dimension_order || 0;
    
    dimensionScores.push({
      dimension,
      dimensionOrder,
      score: Number(avgScore.toFixed(2)),
      maxScore: 5,
      percentage: Number(((avgScore / 5) * 100).toFixed(1))
    });
  });

  // Ordenar por ordem da dimensão
  dimensionScores.sort((a, b) => a.dimensionOrder - b.dimensionOrder);

  // Calcular score total
  const totalScore = dimensionScores.length > 0
    ? dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length
    : 0;

  return {
    dimensionScores,
    totalScore: Number(totalScore.toFixed(2)),
    totalPercentage: Number(((totalScore / 5) * 100).toFixed(1))
  };
}

export function getScoreLevel(score: number): {
  level: "baixo" | "medio" | "alto";
  label: string;
  color: string;
} {
  if (score < 2.5) {
    return { level: "baixo", label: "Em desenvolvimento", color: "text-orange-500" };
  } else if (score < 3.5) {
    return { level: "medio", label: "Moderado", color: "text-yellow-500" };
  } else {
    return { level: "alto", label: "Bem desenvolvido", color: "text-green-500" };
  }
}

export function getWeakestDimensions(scores: DimensionScore[]): DimensionScore[] {
  return [...scores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);
}

export function getStrongestDimensions(scores: DimensionScore[]): DimensionScore[] {
  return [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
}
