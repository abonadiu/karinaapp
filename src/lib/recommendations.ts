export interface Recommendation {
  title: string;
  description: string;
  practices: string[];
}

export const RECOMMENDATIONS: Record<string, Recommendation> = {
  "Consciência Interior": {
    title: "Desenvolva sua Consciência Interior",
    description: "Fortaleça sua capacidade de auto-observação e presença no momento.",
    practices: [
      "Pratique 10 minutos de meditação mindfulness diariamente",
      "Faça pausas conscientes durante o dia para observar seus pensamentos",
      "Mantenha um diário de reflexões sobre padrões que percebe em si",
      "Experimente a técnica de escaneamento corporal antes de dormir"
    ]
  },
  "Coerência Emocional": {
    title: "Desenvolva sua Coerência Emocional",
    description: "Aprimore sua capacidade de reconhecer, nomear e regular suas emoções.",
    practices: [
      "Pratique nomear suas emoções em voz alta quando as sentir",
      "Use técnicas de respiração 4-7-8 em momentos de estresse",
      "Identifique e registre seus gatilhos emocionais",
      "Pratique a comunicação não-violenta para expressar sentimentos"
    ]
  },
  "Conexão e Propósito": {
    title: "Fortaleça sua Conexão e Propósito",
    description: "Aprofunde o alinhamento entre seus valores e suas ações cotidianas.",
    practices: [
      "Escreva uma carta para seu 'eu futuro' descrevendo sua vida ideal",
      "Identifique seus 5 valores mais importantes e como vivenciá-los",
      "Pratique gratidão escrevendo 3 coisas boas do dia toda noite",
      "Reserve tempo semanal para atividades que tragam significado"
    ]
  },
  "Relações e Compaixão": {
    title: "Cultive Relações e Compaixão",
    description: "Desenvolva empatia, conexão genuína e autocompaixão.",
    practices: [
      "Pratique escuta ativa sem interromper ou julgar",
      "Faça um exercício de autocompaixão quando cometer erros",
      "Expresse gratidão genuína a alguém importante toda semana",
      "Pratique a meditação de bondade amorosa (Metta)"
    ]
  },
  "Transformação": {
    title: "Abrace a Transformação",
    description: "Desenvolva flexibilidade, abertura para mudança e crescimento contínuo.",
    practices: [
      "Desafie-se a fazer algo fora da zona de conforto semanalmente",
      "Mantenha um 'diário de aprendizados' sobre erros e lições",
      "Busque feedback construtivo de pessoas de confiança",
      "Celebre pequenas vitórias no seu processo de crescimento"
    ]
  }
};

export function getRecommendationsForWeakDimensions(
  weakDimensions: string[]
): Recommendation[] {
  return weakDimensions
    .map(dim => RECOMMENDATIONS[dim])
    .filter(Boolean);
}
