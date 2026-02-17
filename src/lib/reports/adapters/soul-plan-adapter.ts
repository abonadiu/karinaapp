import { TestAdapter, TestSummary, KeyTrait, ComparisonMetric } from '../test-adapter';

const ENERGY_CATEGORIES = {
  worldly: { label: 'Mundano', color: '#F59E0B' },
  spiritual: { label: 'Espiritual', color: '#8B5CF6' },
  soul: { label: 'Alma', color: '#EC4899' },
};

const ENERGY_TAGS: Record<string, string[]> = {
  '1': ['criatividade', 'independência', 'liderança', 'fogo', 'ação'],
  '2': ['cooperação', 'diplomacia', 'sensibilidade', 'água', 'harmonia'],
  '3': ['expressão', 'comunicação', 'alegria', 'ar', 'criatividade'],
  '4': ['estrutura', 'estabilidade', 'trabalho', 'terra', 'organização'],
  '5': ['liberdade', 'mudança', 'aventura', 'fogo', 'adaptação'],
  '6': ['responsabilidade', 'cuidado', 'harmonia', 'água', 'família'],
  '7': ['introspecção', 'sabedoria', 'espiritualidade', 'ar', 'análise'],
  '8': ['poder', 'abundância', 'manifestação', 'terra', 'liderança'],
  '9': ['humanitarismo', 'compaixão', 'universalidade', 'água', 'altruísmo'],
  '11': ['intuição', 'iluminação', 'inspiração', 'ar', 'espiritualidade'],
  '22': ['construção', 'visão', 'mestria', 'terra', 'realização'],
};

export const soulPlanAdapter: TestAdapter = {
  slug: 'mapa_da_alma',
  displayName: 'Mapa da Alma (Soul Plan)',
  icon: 'star',
  color: '#EC4899',

  getSummary(testResult: any): TestSummary {
    const soulPlanResult = testResult.exercises_data?.soulPlanResult;
    if (!soulPlanResult) {
      return {
        headline: 'Mapa da Alma',
        summary: 'Resultado do Mapa da Alma disponível.',
      };
    }

    const soulDestiny = soulPlanResult.soulDestinyNumber;
    const fullName = soulPlanResult.fullName || '';

    return {
      headline: `Mapa da Alma — Destino da Alma: ${soulDestiny || 'N/A'}`,
      summary: `O Mapa da Alma de "${fullName}" revela o propósito de vida e as energias que guiam sua jornada. O número do Destino da Alma é ${soulDestiny}, representando a síntese de todas as energias mundanas e espirituais do mapa.`,
    };
  },

  getKeyTraits(testResult: any): KeyTrait[] {
    const soulPlanResult = testResult.exercises_data?.soulPlanResult;
    if (!soulPlanResult) return [];

    const traits: KeyTrait[] = [];

    // Extract energies from each category
    const categories = ['worldly', 'spiritual', 'soul'] as const;
    const positions = ['goal', 'talent', 'challenge'] as const;
    const positionLabels: Record<string, string> = {
      goal: 'Objetivo',
      talent: 'Talento',
      challenge: 'Desafio',
    };

    for (const cat of categories) {
      for (const pos of positions) {
        const key = `${cat}${pos.charAt(0).toUpperCase() + pos.slice(1)}`;
        const energy = soulPlanResult[key];
        if (energy !== undefined && energy !== null) {
          const energyStr = String(energy);
          traits.push({
            category: ENERGY_CATEGORIES[cat]?.label || cat,
            label: `${positionLabels[pos]} ${ENERGY_CATEGORIES[cat]?.label}: ${energyStr}`,
            description: `${ENERGY_CATEGORIES[cat]?.label} — ${positionLabels[pos]}: Energia ${energyStr}`,
            tags: ENERGY_TAGS[energyStr] || ['espiritualidade', 'propósito'],
          });
        }
      }
    }

    // Soul Destiny
    if (soulPlanResult.soulDestinyNumber) {
      traits.push({
        category: 'Destino',
        label: `Destino da Alma: ${soulPlanResult.soulDestinyNumber}`,
        description: `O número do Destino da Alma é ${soulPlanResult.soulDestinyNumber}, representando a síntese de todas as energias.`,
        tags: ENERGY_TAGS[String(soulPlanResult.soulDestinyNumber)] || ['propósito', 'destino'],
      });
    }

    return traits;
  },

  getComparisonMetrics(testResult: any): ComparisonMetric[] {
    const scores = testResult.dimension_scores || {};
    const metrics: ComparisonMetric[] = [];

    // Use dimension_scores if available (some implementations store numeric scores)
    for (const [dim, val] of Object.entries(scores)) {
      const numVal = Number(val);
      if (!isNaN(numVal)) {
        metrics.push({
          key: dim,
          label: dim,
          value: (numVal / 5) * 100,
          maxValue: 100,
          color: '#EC4899',
        });
      }
    }

    // If no numeric scores, create basic metrics from energies
    if (metrics.length === 0) {
      const soulPlanResult = testResult.exercises_data?.soulPlanResult;
      if (soulPlanResult) {
        const categories = ['worldly', 'spiritual', 'soul'] as const;
        for (const cat of categories) {
          const goal = Number(soulPlanResult[`${cat}Goal`]) || 0;
          const talent = Number(soulPlanResult[`${cat}Talent`]) || 0;
          const challenge = Number(soulPlanResult[`${cat}Challenge`]) || 0;
          const avg = (goal + talent + challenge) / 3;
          metrics.push({
            key: cat,
            label: ENERGY_CATEGORIES[cat]?.label || cat,
            value: (avg / 22) * 100, // Normalize to 0-100 (max energy is 22)
            maxValue: 100,
            color: ENERGY_CATEGORIES[cat]?.color || '#EC4899',
          });
        }
      }
    }

    return metrics;
  },

  getCrossAnalysisPromptData(testResult: any): string {
    const soulPlanResult = testResult.exercises_data?.soulPlanResult;
    if (!soulPlanResult) return 'Mapa da Alma: dados não disponíveis.';

    const lines: string[] = [`Mapa da Alma (nome: "${soulPlanResult.fullName || ''}"):`];

    const categories = ['worldly', 'spiritual', 'soul'] as const;
    const positions = ['goal', 'talent', 'challenge'] as const;
    const positionLabels: Record<string, string> = {
      goal: 'Objetivo',
      talent: 'Talento',
      challenge: 'Desafio',
    };

    for (const cat of categories) {
      lines.push(`\n${ENERGY_CATEGORIES[cat]?.label}:`);
      for (const pos of positions) {
        const key = `${cat}${pos.charAt(0).toUpperCase() + pos.slice(1)}`;
        const energy = soulPlanResult[key];
        if (energy !== undefined) {
          lines.push(`- ${positionLabels[pos]}: Energia ${energy}`);
        }
      }
    }

    if (soulPlanResult.soulDestinyNumber) {
      lines.push(`\nDestino da Alma: ${soulPlanResult.soulDestinyNumber}`);
    }

    return lines.join('\n');
  },
};
