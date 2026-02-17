import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, Download, Brain, Target, Star, Globe, Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { ParticipantTestData } from '@/lib/reports/test-adapter';
import { fetchParticipantTestData } from '@/lib/reports/report-data-service';
import { generateCrossAnalysis } from '@/lib/reports/cross-analysis-service';
import { DiagnosticResults } from '@/components/diagnostic/DiagnosticResults';
import { DiscResults } from '@/components/disc/DiscResults';
import { SoulPlanResults } from '@/components/soul-plan/SoulPlanResults';
import { AstralChartResults } from '@/components/astral-chart/AstralChartResults';

const ICON_MAP: Record<string, React.ReactNode> = {
  brain: <Brain className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
  star: <Star className="h-5 w-5" />,
  globe: <Globe className="h-5 w-5" />,
};

interface UnifiedReportProps {
  participantId: string;
  participantName?: string;
  onGeneratePDF?: (data: ParticipantTestData, crossAnalysis: string) => void;
}

export function UnifiedReport({ participantId, participantName, onGeneratePDF }: UnifiedReportProps) {
  const [data, setData] = useState<ParticipantTestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [crossAnalysis, setCrossAnalysis] = useState<string>('');
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [participantId]);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchParticipantTestData(participantId);
    setData(result);
    setLoading(false);

    // Auto-generate cross analysis if 2+ tests
    if (result && result.tests.length >= 2) {
      generateAnalysis(result);
    }
  };

  const generateAnalysis = async (testData: ParticipantTestData) => {
    setIsGeneratingAnalysis(true);
    try {
      const analysis = await generateCrossAnalysis(testData);
      setCrossAnalysis(analysis);
    } catch (error) {
      console.error('Error generating analysis:', error);
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const toggleTestExpanded = (slug: string) => {
    setExpandedTests(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando relatório unificado...</p>
      </div>
    );
  }

  if (!data || data.tests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum teste concluído</h3>
          <p className="text-muted-foreground">
            O participante precisa concluir pelo menos um teste para gerar o relatório unificado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Relatório Unificado
          </h2>
          <p className="text-muted-foreground">
            {data.participantName} {data.company ? `• ${data.company}` : ''}
          </p>
        </div>
        {onGeneratePDF && (
          <Button
            onClick={() => onGeneratePDF(data, crossAnalysis)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        )}
      </div>

      {/* Tests Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Testes Realizados ({data.tests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.tests.map(test => (
              <div
                key={test.slug}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: test.adapter.color }}
                >
                  {ICON_MAP[test.adapter.icon] || <FileText className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{test.displayName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{test.summary.headline}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Concluído em {new Date(test.completedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {test.summary.mainScore !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {test.summary.mainScore.toFixed(0)}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross Analysis */}
      {data.tests.length >= 2 && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Análise Cruzada Integrada
            </CardTitle>
            {crossAnalysis && !isGeneratingAnalysis && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => data && generateAnalysis(data)}
                className="gap-2 text-muted-foreground hover:text-primary"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isGeneratingAnalysis ? (
              <div className="flex items-center gap-3 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Gerando análise cruzada personalizada com inteligência artificial...
                </p>
              </div>
            ) : crossAnalysis ? (
              <div className="prose prose-sm max-w-none">
                {crossAnalysis.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h3 key={i} className="text-base font-bold mt-4 mb-2 text-foreground">{line.replace(/\*\*/g, '')}</h3>;
                  }
                  if (line.trim() === '') return <br key={i} />;
                  // Handle inline bold
                  const parts = line.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2">
                      {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j} className="text-foreground">{part.replace(/\*\*/g, '')}</strong>;
                        }
                        return <span key={j}>{part}</span>;
                      })}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={() => data && generateAnalysis(data)}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Gerar Análise Cruzada
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Individual Test Results (Collapsible) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Resultados Detalhados por Teste</h3>
        {data.tests.map(test => (
          <Card key={test.slug}>
            <CardHeader
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => toggleTestExpanded(test.slug)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: test.adapter.color }}
                  >
                    {ICON_MAP[test.adapter.icon] || <FileText className="h-4 w-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-base">{test.displayName}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{test.summary.headline}</p>
                  </div>
                </div>
                {expandedTests.has(test.slug) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {expandedTests.has(test.slug) && (
              <CardContent>
                <TestResultRenderer slug={test.slug} result={test.result} participantName={data.participantName} />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Renders the appropriate result component based on test slug */
function TestResultRenderer({ slug, result, participantName }: { slug: string; result: any; participantName: string }) {
  switch (slug) {
    case 'iq_is': {
      // DiagnosticResults expects `scores: DiagnosticScores` which contains
      // { dimensionScores, totalScore, totalPercentage }.
      // It also accepts `existingResult` and reconstructs scores from it internally.
      // Passing existingResult is the simplest and most reliable approach.
      const diagnosticScores = {
        dimensionScores: Object.entries(result.dimension_scores || {}).map(([dimension, scoreVal], index) => ({
          dimension,
          dimensionOrder: index + 1,
          score: typeof scoreVal === 'number' ? scoreVal : (scoreVal as any)?.score ?? 0,
          maxScore: 5,
          percentage: ((typeof scoreVal === 'number' ? scoreVal : (scoreVal as any)?.score ?? 0) / 5) * 100,
        })),
        totalScore: Number(result.total_score),
        totalPercentage: (Number(result.total_score) / 5) * 100,
      };
      return (
        <DiagnosticResults
          participantName={participantName}
          scores={diagnosticScores}
          existingResult={result}
        />
      );
    }
    case 'disc': {
      // DiscResults accepts `existingResult` and reconstructs dimension scores internally.
      // No need to pass dimensionScores/totalScore separately.
      return (
        <DiscResults
          participantName={participantName}
          existingResult={result}
        />
      );
    }
    case 'mapa_da_alma': {
      // SoulPlanResults accepts `soulPlanResult` (not `result`) or `existingResult`.
      // Passing existingResult lets it reconstruct from exercises_data internally.
      const soulPlanData = result.exercises_data?.soulPlanResult;
      return (
        <SoulPlanResults
          participantName={participantName}
          soulPlanResult={soulPlanData}
          existingResult={result}
        />
      );
    }
    case 'mapa_astral': {
      const chartResult = result.exercises_data?.fullResult;
      if (chartResult) {
        return <AstralChartResults result={chartResult} participantName={participantName} />;
      }
      return <p className="text-muted-foreground">Dados do Mapa Astral não disponíveis.</p>;
    }
    default:
      return (
        <div className="text-center py-4 text-muted-foreground">
          <p>Visualização detalhada não disponível para este tipo de teste.</p>
          <p className="text-sm mt-1">Score: {Number(result.total_score).toFixed(1)}/5</p>
        </div>
      );
  }
}
