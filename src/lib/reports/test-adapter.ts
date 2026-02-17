/**
 * TestAdapter - Interface extensível para integrar qualquer tipo de teste
 * nos Relatórios Unificado e Comparativo.
 * 
 * Para adicionar um novo teste (ex: Numerologia):
 * 1. Crie um arquivo numerologia-adapter.ts implementando TestAdapter
 * 2. Registre-o em test-adapter-registry.ts
 * 3. Pronto! O relatório unificado e comparativo já incluirão o novo teste.
 */

export interface KeyTrait {
  /** Categoria do traço (ex: "personalidade", "comunicação", "liderança") */
  category: string;
  /** Rótulo curto do traço (ex: "Perfil Dominante", "Sol em Leão") */
  label: string;
  /** Descrição do traço para análise cruzada */
  description: string;
  /** Valor numérico normalizado 0-100 (para comparação) */
  value?: number;
  /** Tags para correlação entre testes (ex: ["fogo", "extroversão", "ação"]) */
  tags: string[];
}

export interface TestSummary {
  /** Título curto do resultado (ex: "Perfil DI — Dominante Influente") */
  headline: string;
  /** Resumo em 2-3 frases */
  summary: string;
  /** Pontuação principal (0-100) se aplicável */
  mainScore?: number;
  /** Rótulo da pontuação (ex: "Score Geral", "Compatibilidade") */
  mainScoreLabel?: string;
}

export interface ComparisonMetric {
  /** Chave única da métrica (ex: "D", "consciencia_interior") */
  key: string;
  /** Nome da métrica (ex: "Dominância", "Consciência Interior") */
  label: string;
  /** Valor normalizado 0-100 */
  value: number;
  /** Valor máximo para escala (default: 100) */
  maxValue?: number;
  /** Cor para visualização */
  color: string;
}

export interface TestAdapter {
  /** Slug do teste (deve corresponder ao slug na tabela test_types) */
  slug: string;
  
  /** Nome de exibição do teste */
  displayName: string;
  
  /** Ícone do teste (nome do ícone Lucide) */
  icon: string;
  
  /** Cor primária do teste (hex) */
  color: string;

  /**
   * Extrai um resumo do resultado do teste.
   * @param testResult - O objeto de resultado do test_results
   * @returns Resumo estruturado do teste
   */
  getSummary(testResult: any): TestSummary;

  /**
   * Extrai os traços-chave para análise cruzada.
   * As tags são usadas para encontrar correlações entre testes.
   * @param testResult - O objeto de resultado do test_results
   * @returns Lista de traços-chave com tags
   */
  getKeyTraits(testResult: any): KeyTrait[];

  /**
   * Extrai métricas para comparação entre participantes.
   * @param testResult - O objeto de resultado do test_results
   * @returns Lista de métricas normalizadas (0-100)
   */
  getComparisonMetrics(testResult: any): ComparisonMetric[];

  /**
   * Gera o prompt para a IA criar a análise cruzada.
   * @param testResult - O objeto de resultado do test_results
   * @returns Texto descritivo dos resultados para o prompt da IA
   */
  getCrossAnalysisPromptData(testResult: any): string;
}

/**
 * Dados consolidados de todos os testes de um participante
 */
export interface ParticipantTestData {
  participantId: string;
  participantName: string;
  participantEmail: string;
  company?: string;
  tests: {
    slug: string;
    displayName: string;
    completedAt: string;
    result: any;
    adapter: TestAdapter;
    summary: TestSummary;
    keyTraits: KeyTrait[];
    comparisonMetrics: ComparisonMetric[];
  }[];
}

/**
 * Dados para comparação entre participantes
 */
export interface ComparisonData {
  testSlug: string;
  testDisplayName: string;
  participants: {
    id: string;
    name: string;
    metrics: ComparisonMetric[];
    summary: TestSummary;
  }[];
}
