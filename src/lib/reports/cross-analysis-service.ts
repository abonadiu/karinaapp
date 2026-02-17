/**
 * Cross-Analysis Service
 * 
 * Uses AI (GPT) to generate personalized cross-analysis insights
 * by combining results from multiple tests.
 */

import { ParticipantTestData } from './test-adapter';

const CROSS_ANALYSIS_SYSTEM_PROMPT = `Você é uma especialista em desenvolvimento humano e autoconhecimento chamada Karina Bonadiu. 
Você utiliza múltiplas ferramentas de diagnóstico para criar análises profundas e personalizadas.
Seu tom é profissional, empático e inspirador. Escreva em português brasileiro.
Não use emojis. Use parágrafos bem estruturados.`;

function buildCrossAnalysisPrompt(data: ParticipantTestData): string {
  const testDataSections = data.tests
    .map(t => t.adapter.getCrossAnalysisPromptData(t.result))
    .join('\n\n---\n\n');

  // Find correlations between tests via tags
  const allTraits = data.tests.flatMap(t => 
    t.keyTraits.map(trait => ({ testName: t.displayName, ...trait }))
  );

  const tagGroups: Record<string, { testName: string; label: string }[]> = {};
  allTraits.forEach(trait => {
    trait.tags.forEach(tag => {
      if (!tagGroups[tag]) tagGroups[tag] = [];
      tagGroups[tag].push({ testName: trait.testName, label: trait.label });
    });
  });

  const correlations = Object.entries(tagGroups)
    .filter(([, items]) => {
      const uniqueTests = new Set(items.map(i => i.testName));
      return uniqueTests.size >= 2; // Only tags that appear in 2+ different tests
    })
    .map(([tag, items]) => `Tag "${tag}": ${items.map(i => `${i.testName} → ${i.label}`).join('; ')}`)
    .slice(0, 15); // Limit to top 15 correlations

  return `Analise os resultados dos seguintes testes do participante "${data.participantName}" e crie uma análise cruzada profunda.

## Resultados dos Testes:

${testDataSections}

## Correlações Identificadas entre Testes:
${correlations.length > 0 ? correlations.join('\n') : 'Nenhuma correlação automática identificada.'}

## Instruções:
Crie uma análise cruzada com as seguintes seções:

1. **Síntese do Perfil** (2-3 parágrafos): Uma visão integrada de quem é esta pessoa, combinando insights de todos os testes. Identifique padrões que se repetem entre os testes.

2. **Pontos Fortes Convergentes** (2-3 parágrafos): Qualidades que aparecem consistentemente em múltiplos testes, reforçando-se mutuamente.

3. **Áreas de Desenvolvimento** (2-3 parágrafos): Aspectos que os diferentes testes apontam como oportunidades de crescimento.

4. **Recomendações Integradas** (3-5 recomendações práticas): Sugestões que levam em conta o perfil completo do participante.

Formate cada seção com o título em negrito (**Título**) seguido dos parágrafos. Separe as seções com uma linha em branco.`;
}

export async function generateCrossAnalysis(data: ParticipantTestData): Promise<string> {
  // Only generate if there are 2+ completed tests
  if (data.tests.length < 2) {
    return generateSingleTestSummary(data);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: CROSS_ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: buildCrossAnalysisPrompt(data) },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return generateFallbackAnalysis(data);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || generateFallbackAnalysis(data);
  } catch (error) {
    console.error('Error generating cross-analysis:', error);
    return generateFallbackAnalysis(data);
  }
}

function generateSingleTestSummary(data: ParticipantTestData): string {
  if (data.tests.length === 0) return 'Nenhum teste concluído para análise.';
  
  const test = data.tests[0];
  return `**Resumo do Perfil**\n\n${test.summary.summary}\n\nPara uma análise cruzada mais completa, é necessário que o participante conclua pelo menos 2 testes diferentes. Atualmente, apenas o ${test.displayName} foi concluído.`;
}

function generateFallbackAnalysis(data: ParticipantTestData): string {
  const sections: string[] = [];
  
  sections.push('**Síntese do Perfil**\n');
  sections.push(`${data.participantName} completou ${data.tests.length} testes de autoconhecimento. Abaixo está um resumo integrado dos resultados:\n`);
  
  data.tests.forEach(test => {
    sections.push(`**${test.displayName}**: ${test.summary.summary}\n`);
  });

  // Find common tags across tests
  const tagCounts: Record<string, number> = {};
  data.tests.forEach(t => {
    const testTags = new Set<string>();
    t.keyTraits.forEach(trait => {
      trait.tags.forEach(tag => testTags.add(tag));
    });
    testTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const commonThemes = Object.entries(tagCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  if (commonThemes.length > 0) {
    sections.push(`\n**Temas Convergentes**\n`);
    sections.push(`Os seguintes temas aparecem consistentemente nos diferentes testes: ${commonThemes.join(', ')}. Isso sugere que estes são aspectos centrais da personalidade e do potencial do participante.\n`);
  }

  sections.push(`\n**Recomendações**\n`);
  sections.push(`Recomenda-se uma sessão de devolutiva integrando os insights de todos os testes para uma compreensão mais profunda do perfil completo.`);

  return sections.join('\n');
}
