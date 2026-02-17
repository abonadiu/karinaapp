/**
 * Comparative Analysis Service
 * 
 * Uses AI (GPT) via Supabase Edge Function to generate
 * comparative analysis insights across multiple participants
 * for the same test type.
 */

import { supabase } from '@/integrations/backend/client';
import { ComparisonData } from './test-adapter';

const COMPARATIVE_SYSTEM_PROMPT = `Você é uma especialista em desenvolvimento humano e autoconhecimento chamada Karina Bonadiu.
Você analisa resultados de diagnósticos de grupos de participantes para identificar padrões, destaques e oportunidades.
Seu tom é profissional, analítico e construtivo. Escreva em português brasileiro.
Não use emojis. Use parágrafos bem estruturados.`;

function buildComparativePrompt(data: ComparisonData): string {
  // Build participant data sections
  const participantSections = data.participants.map(p => {
    const metricsText = p.metrics
      .map(m => `  - ${m.label}: ${m.value.toFixed(1)}${m.maxValue ? `/${m.maxValue}` : '/100'}`)
      .join('\n');

    return `### ${p.name}
**Perfil**: ${p.summary.headline}
**Resumo**: ${p.summary.summary}
**Métricas**:
${metricsText}`;
  }).join('\n\n');

  // Calculate group statistics
  const allMetricKeys = Array.from(
    new Set(data.participants.flatMap(p => p.metrics.map(m => m.key)))
  );

  const groupStats = allMetricKeys.map(key => {
    const values = data.participants
      .map(p => p.metrics.find(m => m.key === key))
      .filter(Boolean);

    if (values.length === 0) return null;

    const nums = values.map(v => v!.value);
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const label = values[0]!.label;

    // Find who has the highest and lowest
    const highestParticipant = data.participants.find(p =>
      p.metrics.find(m => m.key === key)?.value === max
    );
    const lowestParticipant = data.participants.find(p =>
      p.metrics.find(m => m.key === key)?.value === min
    );

    return `- **${label}**: Média ${avg.toFixed(1)} | Mín ${min.toFixed(1)} (${lowestParticipant?.name}) | Máx ${max.toFixed(1)} (${highestParticipant?.name})`;
  }).filter(Boolean).join('\n');

  return `Analise os resultados comparativos do teste "${data.testDisplayName}" para ${data.participants.length} participantes e crie uma análise de grupo.

## Dados dos Participantes:

${participantSections}

## Estatísticas do Grupo:
${groupStats}

## Instruções:
Crie uma análise comparativa com as seguintes seções:

1. **Visão Geral do Grupo** (2-3 parágrafos): Uma síntese do perfil coletivo. Quais são as tendências gerais? O grupo é homogêneo ou diverso? Quais dimensões se destacam positiva ou negativamente?

2. **Destaques Individuais** (1 parágrafo por participante): Para cada participante, destaque o que o diferencia do grupo — seus pontos fortes relativos e áreas onde está abaixo da média do grupo.

3. **Padrões e Correlações** (1-2 parágrafos): Identifique padrões interessantes — dimensões onde todos pontuam alto ou baixo, contrastes marcantes entre participantes, ou complementaridades entre perfis.

4. **Recomendações para o Facilitador** (3-5 recomendações): Sugestões práticas para o facilitador trabalhar com este grupo, considerando as dinâmicas identificadas, como potencializar os pontos fortes coletivos e como abordar as áreas de desenvolvimento.

Formate cada seção com o título em negrito (**Título**) seguido dos parágrafos. Separe as seções com uma linha em branco.`;
}

export async function generateComparativeAnalysis(data: ComparisonData): Promise<string> {
  // Need at least 2 participants
  if (data.participants.length < 2) {
    return 'É necessário pelo menos 2 participantes para gerar a análise comparativa.';
  }

  try {
    const systemPrompt = COMPARATIVE_SYSTEM_PROMPT;
    const userPrompt = buildComparativePrompt(data);

    // Call the Edge Function securely (API key stays on server)
    const { data: responseData, error } = await supabase.functions.invoke('cross-analysis', {
      body: { systemPrompt, userPrompt },
    });

    if (error) {
      console.error('Edge Function error:', error);
      return generateFallbackComparativeAnalysis(data);
    }

    const analysis = responseData?.analysis;
    if (!analysis) {
      console.error('No analysis returned from Edge Function');
      return generateFallbackComparativeAnalysis(data);
    }

    return analysis;
  } catch (error) {
    console.error('Error generating comparative analysis:', error);
    return generateFallbackComparativeAnalysis(data);
  }
}

function generateFallbackComparativeAnalysis(data: ComparisonData): string {
  const sections: string[] = [];

  sections.push('**Visão Geral do Grupo**\n');
  sections.push(`Este relatório compara ${data.participants.length} participantes no teste ${data.testDisplayName}.\n`);

  // Calculate averages per metric
  const allMetricKeys = Array.from(
    new Set(data.participants.flatMap(p => p.metrics.map(m => m.key)))
  );

  const metricAverages: Record<string, { label: string; avg: number; highest: string; lowest: string }> = {};
  allMetricKeys.forEach(key => {
    const values = data.participants
      .map(p => ({ name: p.name, metric: p.metrics.find(m => m.key === key) }))
      .filter(v => v.metric);

    if (values.length === 0) return;

    const nums = values.map(v => v.metric!.value);
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    const maxVal = Math.max(...nums);
    const minVal = Math.min(...nums);

    metricAverages[key] = {
      label: values[0].metric!.label,
      avg,
      highest: values.find(v => v.metric!.value === maxVal)?.name || '',
      lowest: values.find(v => v.metric!.value === minVal)?.name || '',
    };
  });

  // Group averages
  const avgEntries = Object.values(metricAverages);
  if (avgEntries.length > 0) {
    const highestAvg = avgEntries.reduce((a, b) => a.avg > b.avg ? a : b);
    const lowestAvg = avgEntries.reduce((a, b) => a.avg < b.avg ? a : b);
    sections.push(`A dimensão com maior média do grupo é **${highestAvg.label}** (${highestAvg.avg.toFixed(1)}), enquanto **${lowestAvg.label}** apresenta a menor média (${lowestAvg.avg.toFixed(1)}).\n`);
  }

  sections.push('\n**Destaques Individuais**\n');
  data.participants.forEach(p => {
    const sortedMetrics = [...p.metrics].sort((a, b) => b.value - a.value);
    const strongest = sortedMetrics[0];
    const weakest = sortedMetrics[sortedMetrics.length - 1];
    sections.push(`**${p.name}** — ${p.summary.headline}. Destaque em ${strongest?.label || 'N/A'} (${strongest?.value.toFixed(1) || '0'}). Área de desenvolvimento: ${weakest?.label || 'N/A'} (${weakest?.value.toFixed(1) || '0'}).\n`);
  });

  sections.push('\n**Recomendações**\n');
  sections.push('Recomenda-se uma sessão de devolutiva em grupo para explorar as complementaridades entre os perfis e promover o desenvolvimento coletivo.');

  return sections.join('\n');
}
