import { DimensionScore } from "@/lib/diagnostic-scoring";
import { getScoreLevelBadge } from "@/lib/dimension-descriptions";

interface ExecutiveSummaryData {
  participantName: string;
  totalScore: number;
  dimensionScores: DimensionScore[];
}

const DIMENSION_STRENGTHS: Record<string, string> = {
  "Consciência Interior": "forte capacidade de auto-observação e presença consciente",
  "Coerência Emocional": "maturidade na identificação e regulação das emoções",
  "Conexão e Propósito": "clareza de valores e alinhamento com seu senso de direção",
  "Relações e Compaixão": "empatia genuína e conexão significativa com os outros",
  "Transformação": "abertura para mudança e mentalidade de crescimento",
};

const DIMENSION_DEVELOPMENT: Record<string, string> = {
  "Consciência Interior": "a auto-observação e atenção plena, que são a base para todo desenvolvimento pessoal",
  "Coerência Emocional": "a regulação emocional e expressão autêntica, fundamentais para decisões equilibradas",
  "Conexão e Propósito": "o alinhamento entre valores e ações, essencial para motivação sustentável",
  "Relações e Compaixão": "a empatia e autocompaixão, pilares de relacionamentos saudáveis",
  "Transformação": "a flexibilidade e coragem para mudança, essenciais em um mundo em constante evolução",
};

export function generateExecutiveSummary(data: ExecutiveSummaryData): string {
  const { participantName, totalScore, dimensionScores } = data;
  const firstName = participantName.split(" ")[0];
  const badge = getScoreLevelBadge(totalScore);

  const sorted = [...dimensionScores].sort((a, b) => b.score - a.score);
  const top2 = sorted.slice(0, 2);
  const bottom2 = sorted.slice(-2).reverse();

  // Opening
  let opening: string;
  if (totalScore >= 4) {
    opening = `O perfil de ${firstName} revela um desenvolvimento consolidado e robusto em inteligência emocional e espiritual, com score geral de ${totalScore.toFixed(1)}/5 (${badge.label}).`;
  } else if (totalScore >= 3) {
    opening = `O perfil de ${firstName} revela uma base sólida de inteligência emocional e espiritual, com score geral de ${totalScore.toFixed(1)}/5 (${badge.label}).`;
  } else if (totalScore >= 2) {
    opening = `O perfil de ${firstName} indica um estágio de desenvolvimento com fundamentos presentes e oportunidades claras de crescimento, com score geral de ${totalScore.toFixed(1)}/5 (${badge.label}).`;
  } else {
    opening = `O perfil de ${firstName} revela o início de uma jornada significativa de autoconhecimento, com score geral de ${totalScore.toFixed(1)}/5 (${badge.label}).`;
  }

  // Strengths
  const strength1 = DIMENSION_STRENGTHS[top2[0].dimension] || "";
  const strength2 = DIMENSION_STRENGTHS[top2[1].dimension] || "";
  const strengths = `Suas maiores forças residem em ${top2[0].dimension} (${top2[0].score.toFixed(1)}) e ${top2[1].dimension} (${top2[1].score.toFixed(1)}), indicando ${strength1} e ${strength2}.`;

  // Development areas
  const dev1 = DIMENSION_DEVELOPMENT[bottom2[0].dimension] || "";
  const dev2 = DIMENSION_DEVELOPMENT[bottom2[1].dimension] || "";
  const development = `As áreas que mais se beneficiariam de atenção intencional são ${bottom2[0].dimension} (${bottom2[0].score.toFixed(1)}) e ${bottom2[1].dimension} (${bottom2[1].score.toFixed(1)}), onde há potencial significativo de crescimento — especificamente em ${dev1} e ${dev2}.`;

  // Closing
  const closing = "O fortalecimento dessas áreas pode criar um efeito multiplicador, potencializando as competências já desenvolvidas e ampliando a capacidade de influência positiva em todas as dimensões da vida pessoal e profissional.";

  return `${opening} ${strengths} ${development} ${closing}`;
}
