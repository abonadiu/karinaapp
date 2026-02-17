import { TestAdapter, TestSummary, KeyTrait, ComparisonMetric } from '../test-adapter';

const ELEMENT_LABELS: Record<string, string> = {
  fire: 'Fogo', earth: 'Terra', air: 'Ar', water: 'Água',
};

const MODALITY_LABELS: Record<string, string> = {
  cardinal: 'Cardinal', fixed: 'Fixo', mutable: 'Mutável',
};

const ELEMENT_TAGS: Record<string, string[]> = {
  fire: ['fogo', 'ação', 'energia', 'entusiasmo', 'liderança', 'extroversão'],
  earth: ['terra', 'estabilidade', 'prática', 'organização', 'introversão'],
  air: ['ar', 'comunicação', 'intelecto', 'social', 'criatividade'],
  water: ['água', 'emoção', 'intuição', 'sensibilidade', 'introspecção'],
};

const ELEMENT_COLORS: Record<string, string> = {
  fire: '#E74C3C', earth: '#8B6914', air: '#3498DB', water: '#1ABC9C',
};

const SIGN_ELEMENTS: Record<string, string> = {
  aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
  leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
  sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
};

const SIGN_LABELS_PT: Record<string, string> = {
  aries: 'Áries', taurus: 'Touro', gemini: 'Gêmeos', cancer: 'Câncer',
  leo: 'Leão', virgo: 'Virgem', libra: 'Libra', scorpio: 'Escorpião',
  sagittarius: 'Sagitário', capricorn: 'Capricórnio', aquarius: 'Aquário', pisces: 'Peixes',
};

export const astralChartAdapter: TestAdapter = {
  slug: 'mapa_astral',
  displayName: 'Mapa Astral',
  icon: 'globe',
  color: '#6366F1',

  getSummary(testResult: any): TestSummary {
    const fullResult = testResult.exercises_data?.fullResult;
    if (!fullResult) {
      return {
        headline: 'Mapa Astral',
        summary: 'Resultado do Mapa Astral disponível.',
      };
    }

    const sunLabel = fullResult.sunSignLabel || SIGN_LABELS_PT[fullResult.sunSign] || fullResult.sunSign;
    const moonLabel = fullResult.moonSignLabel || SIGN_LABELS_PT[fullResult.moonSign] || fullResult.moonSign;
    const ascLabel = fullResult.ascendantSignLabel || SIGN_LABELS_PT[fullResult.ascendantSign] || fullResult.ascendantSign;

    return {
      headline: `Sol em ${sunLabel} • Lua em ${moonLabel} • ASC ${ascLabel}`,
      summary: `O mapa astral revela uma essência de ${sunLabel} (Sol), com mundo emocional de ${moonLabel} (Lua) e projeção social de ${ascLabel} (Ascendente). Esta combinação indica uma personalidade que integra as qualidades desses três signos de forma única.`,
    };
  },

  getKeyTraits(testResult: any): KeyTrait[] {
    const fullResult = testResult.exercises_data?.fullResult;
    if (!fullResult) return [];

    const traits: KeyTrait[] = [];

    // Big Three
    const bigThree = [
      { key: 'sun', label: 'Sol', sign: fullResult.sunSign },
      { key: 'moon', label: 'Lua', sign: fullResult.moonSign },
      { key: 'ascendant', label: 'Ascendente', sign: fullResult.ascendantSign },
    ];

    for (const bt of bigThree) {
      const signLabel = SIGN_LABELS_PT[bt.sign] || bt.sign;
      const element = SIGN_ELEMENTS[bt.sign] || '';
      traits.push({
        category: 'astrologia',
        label: `${bt.label} em ${signLabel}`,
        description: `${bt.label} no signo de ${signLabel} (elemento ${ELEMENT_LABELS[element] || element})`,
        tags: [...(ELEMENT_TAGS[element] || []), bt.sign, signLabel.toLowerCase()],
      });
    }

    // Midheaven
    if (fullResult.midheavenSign) {
      const mcLabel = SIGN_LABELS_PT[fullResult.midheavenSign] || fullResult.midheavenSign;
      traits.push({
        category: 'vocação',
        label: `Meio do Céu em ${mcLabel}`,
        description: `Vocação e carreira direcionadas pelas qualidades de ${mcLabel}`,
        tags: ['vocação', 'carreira', ...(ELEMENT_TAGS[SIGN_ELEMENTS[fullResult.midheavenSign]] || [])],
      });
    }

    // Dominant element
    if (fullResult.planets && Array.isArray(fullResult.planets)) {
      const elementCount: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
      fullResult.planets.forEach((p: any) => {
        const el = SIGN_ELEMENTS[p.sign];
        if (el) elementCount[el]++;
      });
      const dominant = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0];
      if (dominant) {
        traits.push({
          category: 'equilíbrio',
          label: `Elemento dominante: ${ELEMENT_LABELS[dominant[0]]}`,
          description: `${dominant[1]} planetas em signos de ${ELEMENT_LABELS[dominant[0]]}`,
          value: (dominant[1] / 10) * 100,
          tags: ELEMENT_TAGS[dominant[0]] || [],
        });
      }
    }

    return traits;
  },

  getComparisonMetrics(testResult: any): ComparisonMetric[] {
    const fullResult = testResult.exercises_data?.fullResult;
    if (!fullResult || !fullResult.planets) return [];

    // Element distribution as comparison metrics
    const elementCount: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
    const planets = Array.isArray(fullResult.planets) ? fullResult.planets : [];
    planets.forEach((p: any) => {
      const el = SIGN_ELEMENTS[p.sign];
      if (el) elementCount[el]++;
    });

    const total = planets.length || 1;
    return Object.entries(elementCount).map(([el, count]) => ({
      key: el,
      label: ELEMENT_LABELS[el] || el,
      value: (count / total) * 100,
      maxValue: 100,
      color: ELEMENT_COLORS[el] || '#6B7280',
    }));
  },

  getCrossAnalysisPromptData(testResult: any): string {
    const fullResult = testResult.exercises_data?.fullResult;
    if (!fullResult) return 'Mapa Astral: dados não disponíveis.';

    const sunLabel = fullResult.sunSignLabel || SIGN_LABELS_PT[fullResult.sunSign] || fullResult.sunSign;
    const moonLabel = fullResult.moonSignLabel || SIGN_LABELS_PT[fullResult.moonSign] || fullResult.moonSign;
    const ascLabel = fullResult.ascendantSignLabel || SIGN_LABELS_PT[fullResult.ascendantSign] || fullResult.ascendantSign;
    const mcLabel = fullResult.midheavenSignLabel || SIGN_LABELS_PT[fullResult.midheavenSign] || fullResult.midheavenSign;

    const lines: string[] = [
      'Mapa Astral:',
      `- Sol: ${sunLabel}`,
      `- Lua: ${moonLabel}`,
      `- Ascendente: ${ascLabel}`,
      `- Meio do Céu: ${mcLabel}`,
    ];

    // Add planet positions
    if (fullResult.planets && Array.isArray(fullResult.planets)) {
      lines.push('\nPlanetas:');
      fullResult.planets
        .filter((p: any) => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(p.key))
        .forEach((p: any) => {
          const signLabel = SIGN_LABELS_PT[p.sign] || p.signLabel || p.sign;
          lines.push(`- ${p.label || p.key} em ${signLabel} (Casa ${p.house})`);
        });
    }

    // Add element balance
    if (fullResult.planets && Array.isArray(fullResult.planets)) {
      const elementCount: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
      fullResult.planets.forEach((p: any) => {
        const el = SIGN_ELEMENTS[p.sign];
        if (el) elementCount[el]++;
      });
      lines.push('\nEquilíbrio dos Elementos:');
      Object.entries(elementCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([el, count]) => {
          lines.push(`- ${ELEMENT_LABELS[el]}: ${count} planetas`);
        });
    }

    return lines.join('\n');
  },
};
