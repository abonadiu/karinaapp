import { Question } from "./diagnostic-questions";

export interface DiscDimensionScore {
  dimension: string;
  dimensionLabel: string;
  score: number;
  maxScore: number;
  percentage: number;
  color: string;
}

export interface DiscProfile {
  primary: string;
  secondary: string;
  label: string;
  description: string;
}

export interface DiscScores {
  dimensionScores: DiscDimensionScore[];
  totalScore: number;
  profile: DiscProfile;
}

const DISC_COLORS: Record<string, string> = {
  D: "#DC2626",
  I: "#F59E0B",
  S: "#16A34A",
  C: "#2563EB",
};

const DISC_LABELS: Record<string, string> = {
  D: "Dominância",
  I: "Influência",
  S: "Estabilidade",
  C: "Conformidade",
};

const DISC_DIMENSION_MAP: Record<string, string> = {
  dominancia: "D",
  influencia: "I",
  estabilidade: "S",
  conformidade: "C",
};

function normalizeDimensionKey(dimension: string): string {
  // Try direct match
  if (DISC_LABELS[dimension]) return dimension;
  
  // Try slug mapping
  const slug = dimension.toLowerCase().replace(/[^a-z]/g, "");
  if (DISC_DIMENSION_MAP[slug]) return DISC_DIMENSION_MAP[slug];
  
  // Try partial match
  if (slug.includes("domin")) return "D";
  if (slug.includes("influen")) return "I";
  if (slug.includes("estabil")) return "S";
  if (slug.includes("conform") || slug.includes("cautela") || slug.includes("conscien")) return "C";
  
  return dimension;
}

export function calculateDiscScores(
  questions: Question[],
  responses: Map<string, number>
): DiscScores {
  // Group questions by dimension
  const dimensionGroups = new Map<string, Question[]>();

  questions.forEach((q) => {
    const key = normalizeDimensionKey(q.dimension);
    const existing = dimensionGroups.get(key) || [];
    existing.push(q);
    dimensionGroups.set(key, existing);
  });

  const dimensionScores: DiscDimensionScore[] = [];

  // Process each DISC dimension in order
  ["D", "I", "S", "C"].forEach((dim) => {
    const dimQuestions = dimensionGroups.get(dim) || [];
    let totalScore = 0;
    let answeredCount = 0;

    dimQuestions.forEach((q) => {
      const response = responses.get(q.id);
      if (response !== undefined) {
        const adjustedScore = q.reverse_scored ? 6 - response : response;
        totalScore += adjustedScore;
        answeredCount++;
      }
    });

    const avgScore = answeredCount > 0 ? totalScore / answeredCount : 0;
    const percentage = (avgScore / 5) * 100;

    dimensionScores.push({
      dimension: dim,
      dimensionLabel: DISC_LABELS[dim],
      score: Number(avgScore.toFixed(2)),
      maxScore: 5,
      percentage: Number(percentage.toFixed(1)),
      color: DISC_COLORS[dim],
    });
  });

  // Determine profile
  const sorted = [...dimensionScores].sort((a, b) => b.score - a.score);
  const primary = sorted[0]?.dimension || "S";
  const secondary = sorted[1]?.dimension || "I";

  const profile = getDiscProfile(primary, secondary);

  const totalScore =
    dimensionScores.length > 0
      ? dimensionScores.reduce((sum, d) => sum + d.score, 0) /
        dimensionScores.length
      : 0;

  return {
    dimensionScores,
    totalScore: Number(totalScore.toFixed(2)),
    profile,
  };
}

export function getDiscProfile(
  primary: string,
  secondary: string
): DiscProfile {
  const profiles: Record<string, { label: string; description: string }> = {
    DI: {
      label: "Dominante Influente",
      description:
        "Você é uma pessoa orientada a resultados que também valoriza o relacionamento com as pessoas. Combina assertividade com entusiasmo, sendo capaz de liderar com energia e motivar equipes.",
    },
    DC: {
      label: "Dominante Cauteloso",
      description:
        "Você combina a orientação a resultados com atenção aos detalhes. É uma pessoa que busca excelência, toma decisões rápidas mas fundamentadas, e mantém altos padrões de qualidade.",
    },
    DS: {
      label: "Dominante Estável",
      description:
        "Você é uma pessoa determinada que também valoriza a estabilidade. Combina a busca por resultados com paciência e persistência, sendo capaz de liderar de forma consistente.",
    },
    ID: {
      label: "Influente Dominante",
      description:
        "Você é uma pessoa carismática e orientada à ação. Combina habilidades sociais excepcionais com determinação, sendo capaz de inspirar e mobilizar pessoas em torno de objetivos.",
    },
    IS: {
      label: "Influente Estável",
      description:
        "Você é uma pessoa calorosa e acolhedora que valoriza relacionamentos profundos. Combina entusiasmo com paciência, criando ambientes harmoniosos e colaborativos.",
    },
    IC: {
      label: "Influente Cauteloso",
      description:
        "Você combina habilidades sociais com pensamento analítico. É uma pessoa que sabe se comunicar bem e ao mesmo tempo mantém atenção aos detalhes e à qualidade.",
    },
    SD: {
      label: "Estável Dominante",
      description:
        "Você é uma pessoa confiável e persistente que também sabe ser assertiva quando necessário. Combina estabilidade com determinação, sendo um pilar de consistência.",
    },
    SI: {
      label: "Estável Influente",
      description:
        "Você é uma pessoa paciente e sociável que valoriza harmonia e relacionamentos. Combina lealdade com simpatia, sendo um excelente mediador e colaborador.",
    },
    SC: {
      label: "Estável Cauteloso",
      description:
        "Você é uma pessoa metódica e confiável que valoriza precisão e consistência. Combina paciência com atenção aos detalhes, sendo excelente em tarefas que exigem cuidado.",
    },
    CD: {
      label: "Cauteloso Dominante",
      description:
        "Você combina pensamento analítico com orientação a resultados. É uma pessoa que busca excelência através de planejamento cuidadoso e execução determinada.",
    },
    CI: {
      label: "Cauteloso Influente",
      description:
        "Você combina análise detalhada com habilidades de comunicação. É uma pessoa que sabe apresentar dados e ideias de forma envolvente e persuasiva.",
    },
    CS: {
      label: "Cauteloso Estável",
      description:
        "Você é uma pessoa analítica e paciente que valoriza precisão e estabilidade. Combina pensamento crítico com consistência, sendo excelente em trabalhos que exigem rigor.",
    },
    DD: {
      label: "Dominante",
      description:
        "Você é uma pessoa altamente orientada a resultados, assertiva e direta. Gosta de desafios, toma decisões rápidas e busca eficiência em tudo que faz.",
    },
    II: {
      label: "Influente",
      description:
        "Você é uma pessoa altamente sociável, entusiasta e otimista. Gosta de interagir com pessoas, é persuasiva e cria ambientes positivos ao seu redor.",
    },
    SS: {
      label: "Estável",
      description:
        "Você é uma pessoa altamente confiável, paciente e leal. Valoriza harmonia, consistência e relacionamentos duradouros. É um pilar de estabilidade.",
    },
    CC: {
      label: "Cauteloso",
      description:
        "Você é uma pessoa altamente analítica, precisa e detalhista. Valoriza qualidade, procedimentos claros e toma decisões baseadas em dados e fatos.",
    },
  };

  const key = primary === secondary ? `${primary}${primary}` : `${primary}${secondary}`;
  const fallback = profiles[`${primary}${primary}`] || {
    label: `${DISC_LABELS[primary]}`,
    description: "Seu perfil reflete uma combinação única de características comportamentais.",
  };

  return {
    primary,
    secondary,
    ...(profiles[key] || fallback),
  };
}

export function getDiscScoreLevel(percentage: number): {
  level: "baixo" | "moderado" | "alto" | "muito_alto";
  label: string;
} {
  if (percentage < 30) return { level: "baixo", label: "Baixo" };
  if (percentage < 50) return { level: "moderado", label: "Moderado" };
  if (percentage < 75) return { level: "alto", label: "Alto" };
  return { level: "muito_alto", label: "Muito Alto" };
}

export function getDimensionColor(dimension: string): string {
  return DISC_COLORS[normalizeDimensionKey(dimension)] || "#6B7280";
}

export function getDimensionLabel(dimension: string): string {
  const key = normalizeDimensionKey(dimension);
  return DISC_LABELS[key] || dimension;
}
