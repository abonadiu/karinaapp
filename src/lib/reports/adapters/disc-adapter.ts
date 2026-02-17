import { TestAdapter, TestSummary, KeyTrait, ComparisonMetric } from '../test-adapter';

const DISC_LABELS: Record<string, string> = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
};

const DISC_COLORS: Record<string, string> = {
  D: '#E74C3C',
  I: '#F1C40F',
  S: '#2ECC71',
  C: '#3498DB',
};

const DISC_TAGS: Record<string, string[]> = {
  D: ['liderança', 'ação', 'decisão', 'fogo', 'extroversão', 'assertividade'],
  I: ['comunicação', 'entusiasmo', 'social', 'ar', 'extroversão', 'criatividade'],
  S: ['estabilidade', 'paciência', 'harmonia', 'água', 'introversão', 'cuidado'],
  C: ['análise', 'precisão', 'organização', 'terra', 'introversão', 'método'],
};

const DISC_DESCRIPTIONS: Record<string, string> = {
  D: 'orientado a resultados, direto, decisivo e competitivo',
  I: 'comunicativo, entusiasta, otimista e persuasivo',
  S: 'paciente, confiável, cooperativo e bom ouvinte',
  C: 'analítico, preciso, sistemático e orientado a qualidade',
};

function normalizeDimKey(key: string): string {
  const map: Record<string, string> = {
    dominance: 'D', dominância: 'D', d: 'D',
    influence: 'I', influência: 'I', i: 'I',
    steadiness: 'S', estabilidade: 'S', s: 'S',
    conscientiousness: 'C', conformidade: 'C', c: 'C',
  };
  return map[key.toLowerCase()] || key.toUpperCase();
}

export const discAdapter: TestAdapter = {
  slug: 'disc',
  displayName: 'Perfil DISC',
  icon: 'target',
  color: '#E74C3C',

  getSummary(testResult: any): TestSummary {
    const scores = testResult.dimension_scores || {};
    const normalized = Object.entries(scores)
      .map(([dim, val]) => ({ dim: normalizeDimKey(dim), score: Number(val) }))
      .sort((a, b) => b.score - a.score);

    const primary = normalized[0];
    const secondary = normalized[1];

    const primaryLabel = DISC_LABELS[primary?.dim] || primary?.dim;
    const secondaryLabel = DISC_LABELS[secondary?.dim] || secondary?.dim;

    return {
      headline: `Perfil ${primary?.dim}${secondary?.dim} — ${primaryLabel}-${secondaryLabel}`,
      summary: `O perfil predominante é ${primaryLabel} (${primary?.score.toFixed(1)}/5), indicando alguém ${DISC_DESCRIPTIONS[primary?.dim] || ''}. O traço secundário é ${secondaryLabel} (${secondary?.score.toFixed(1)}/5), adicionando características de alguém ${DISC_DESCRIPTIONS[secondary?.dim] || ''}.`,
      mainScore: primary ? (primary.score / 5) * 100 : 0,
      mainScoreLabel: `Perfil ${primary?.dim}${secondary?.dim}`,
    };
  },

  getKeyTraits(testResult: any): KeyTrait[] {
    const scores = testResult.dimension_scores || {};
    return Object.entries(scores).map(([dim, val]) => {
      const key = normalizeDimKey(dim);
      const score = Number(val);
      return {
        category: 'comportamento',
        label: `${DISC_LABELS[key] || key} (${key})`,
        description: `${DISC_LABELS[key] || key}: ${score.toFixed(1)}/5 — ${DISC_DESCRIPTIONS[key] || ''}`,
        value: (score / 5) * 100,
        tags: DISC_TAGS[key] || [],
      };
    });
  },

  getComparisonMetrics(testResult: any): ComparisonMetric[] {
    const scores = testResult.dimension_scores || {};
    return Object.entries(scores).map(([dim, val]) => {
      const k = normalizeDimKey(dim);
      return {
        key: k,
        label: DISC_LABELS[k] || k,
        value: (Number(val) / 5) * 100,
        maxValue: 100,
        color: DISC_COLORS[k] || '#6B7280',
      };
    });
  },

  getCrossAnalysisPromptData(testResult: any): string {
    const scores = testResult.dimension_scores || {};
    const normalized = Object.entries(scores)
      .map(([dim, val]) => ({ dim: normalizeDimKey(dim), score: Number(val) }))
      .sort((a, b) => b.score - a.score);

    const lines = normalized
      .map(({ dim, score }) => `- ${DISC_LABELS[dim] || dim} (${dim}): ${score.toFixed(1)}/5`)
      .join('\n');

    const primary = normalized[0];
    const secondary = normalized[1];
    return `Perfil DISC (perfil ${primary?.dim}${secondary?.dim}):\n${lines}\nPerfil predominante: ${DISC_LABELS[primary?.dim]} — ${DISC_DESCRIPTIONS[primary?.dim] || ''}`;
  },
};
