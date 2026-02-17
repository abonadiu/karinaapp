import { TestAdapter, TestSummary, KeyTrait, ComparisonMetric } from '../test-adapter';

const DIMENSION_LABELS: Record<string, string> = {
  consciencia: 'Consciência Interior',
  coerencia: 'Coerência Emocional',
  proposito: 'Propósito de Vida',
  compaixao: 'Compaixão e Empatia',
  transformacao: 'Transformação Pessoal',
};

const DIMENSION_COLORS: Record<string, string> = {
  consciencia: '#8B5CF6',
  coerencia: '#EC4899',
  proposito: '#F59E0B',
  compaixao: '#10B981',
  transformacao: '#3B82F6',
};

const DIMENSION_TAGS: Record<string, string[]> = {
  consciencia: ['introspecção', 'autoconhecimento', 'consciência', 'reflexão'],
  coerencia: ['emoção', 'equilíbrio', 'estabilidade', 'harmonia'],
  proposito: ['direção', 'motivação', 'objetivo', 'vocação'],
  compaixao: ['empatia', 'relacionamento', 'cuidado', 'altruísmo'],
  transformacao: ['mudança', 'crescimento', 'adaptação', 'evolução'],
};

export const ciAdapter: TestAdapter = {
  slug: 'iq-is',
  displayName: 'Diagnóstico de Consciência Integral',
  icon: 'brain',
  color: '#8B5CF6',

  getSummary(testResult: any): TestSummary {
    const scores = testResult.dimension_scores || {};
    const totalScore = Number(testResult.total_score || 0);
    const percentage = (totalScore / 5) * 100;

    const sorted = Object.entries(scores)
      .map(([dim, val]) => ({ dim, score: Number(val) }))
      .sort((a, b) => b.score - a.score);

    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    let level = 'em desenvolvimento';
    if (percentage >= 80) level = 'elevado';
    else if (percentage >= 60) level = 'bom';
    else if (percentage >= 40) level = 'moderado';

    return {
      headline: `Nível ${level} de Consciência Integral (${totalScore.toFixed(1)}/5)`,
      summary: `O participante apresenta um nível ${level} de consciência integral, com destaque para ${DIMENSION_LABELS[strongest?.dim] || 'consciência'} (${Number(strongest?.score || 0).toFixed(1)}/5) e oportunidade de desenvolvimento em ${DIMENSION_LABELS[weakest?.dim] || 'transformação'} (${Number(weakest?.score || 0).toFixed(1)}/5).`,
      mainScore: percentage,
      mainScoreLabel: 'Score Geral',
    };
  },

  getKeyTraits(testResult: any): KeyTrait[] {
    const scores = testResult.dimension_scores || {};
    return Object.entries(scores).map(([dim, val]) => {
      const score = Number(val);
      const percentage = (score / 5) * 100;
      return {
        category: 'consciência',
        label: DIMENSION_LABELS[dim] || dim,
        description: `${DIMENSION_LABELS[dim] || dim}: ${score.toFixed(1)}/5 (${percentage.toFixed(0)}%)`,
        value: percentage,
        tags: DIMENSION_TAGS[dim] || [],
      };
    });
  },

  getComparisonMetrics(testResult: any): ComparisonMetric[] {
    const scores = testResult.dimension_scores || {};
    return Object.entries(scores).map(([dim, val]) => ({
      key: dim,
      label: DIMENSION_LABELS[dim] || dim,
      value: (Number(val) / 5) * 100,
      maxValue: 100,
      color: DIMENSION_COLORS[dim] || '#6B7280',
    }));
  },

  getCrossAnalysisPromptData(testResult: any): string {
    const scores = testResult.dimension_scores || {};
    const totalScore = Number(testResult.total_score || 0);
    const lines = Object.entries(scores)
      .map(([dim, val]) => `- ${DIMENSION_LABELS[dim] || dim}: ${Number(val).toFixed(1)}/5`)
      .join('\n');
    return `Diagnóstico de Consciência Integral (score geral: ${totalScore.toFixed(1)}/5):\n${lines}`;
  },
};
