import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Download, BarChart3, ArrowUpDown } from 'lucide-react';
import { ComparisonData } from '@/lib/reports/test-adapter';
import { fetchComparisonData } from '@/lib/reports/report-data-service';
import { getTestAdapter, getAllAdapters } from '@/lib/reports/test-adapter-registry';

interface ComparativeReportProps {
  participantIds: string[];
  testSlug: string;
  onGeneratePDF?: (data: ComparisonData) => void;
}

export function ComparativeReport({ participantIds, testSlug, onGeneratePDF }: ComparativeReportProps) {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    loadData();
  }, [participantIds, testSlug]);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchComparisonData(participantIds, testSlug);
    setData(result);
    setLoading(false);
  };

  const handleSort = (metricKey: string) => {
    if (sortBy === metricKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(metricKey);
      setSortAsc(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando relatório comparativo...</p>
      </div>
    );
  }

  if (!data || data.participants.length < 2) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Dados insuficientes</h3>
          <p className="text-muted-foreground">
            É necessário pelo menos 2 participantes com o teste concluído para gerar a comparação.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get all unique metric keys
  const allMetricKeys = Array.from(
    new Set(data.participants.flatMap(p => p.metrics.map(m => m.key)))
  );

  // Sort participants
  const sortedParticipants = [...data.participants].sort((a, b) => {
    if (!sortBy) return 0;
    const aMetric = a.metrics.find(m => m.key === sortBy);
    const bMetric = b.metrics.find(m => m.key === sortBy);
    const aVal = aMetric?.value ?? 0;
    const bVal = bMetric?.value ?? 0;
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  // Get max value for each metric (for bar chart scaling)
  const maxValues: Record<string, number> = {};
  allMetricKeys.forEach(key => {
    maxValues[key] = Math.max(...data.participants.map(p => {
      const m = p.metrics.find(met => met.key === key);
      return m?.maxValue ?? m?.value ?? 0;
    }));
  });

  const adapter = getTestAdapter(testSlug);
  const testColor = adapter?.color || '#6B7280';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Relatório Comparativo
          </h2>
          <p className="text-muted-foreground">
            {data.testDisplayName} — {data.participants.length} participantes
          </p>
        </div>
        {onGeneratePDF && (
          <Button onClick={() => onGeneratePDF(data)} className="gap-2">
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{data.participants.length}</p>
                <p className="text-sm text-muted-foreground">Participantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{allMetricKeys.length}</p>
                <p className="text-sm text-muted-foreground">Métricas comparadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: testColor }}
              >
                <span className="text-white text-xs font-bold">
                  {data.testDisplayName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold">{data.testDisplayName}</p>
                <p className="text-sm text-muted-foreground">Teste comparado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparação de Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                    Participante
                  </th>
                  {allMetricKeys.map(key => {
                    const sampleMetric = data.participants[0]?.metrics.find(m => m.key === key);
                    return (
                      <th
                        key={key}
                        className="text-center py-3 px-2 font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {sampleMetric?.label || key}
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedParticipants.map((participant, idx) => (
                  <tr key={participant.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="py-3 px-2 font-medium">{participant.name}</td>
                    {allMetricKeys.map(key => {
                      const metric = participant.metrics.find(m => m.key === key);
                      const value = metric?.value ?? 0;
                      const max = maxValues[key] || 1;
                      const percentage = (value / max) * 100;

                      // Find if this is the highest value
                      const allValues = data.participants.map(p => p.metrics.find(m => m.key === key)?.value ?? 0);
                      const isHighest = value === Math.max(...allValues);

                      return (
                        <td key={key} className="py-3 px-2">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-sm font-semibold ${isHighest ? 'text-primary' : 'text-foreground'}`}>
                              {value.toFixed(1)}
                              {isHighest && <span className="text-xs ml-1">★</span>}
                            </span>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: isHighest ? testColor : '#9CA3AF',
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Individual Summaries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo Individual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedParticipants.map(participant => (
            <div key={participant.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{participant.name}</h4>
                <Badge variant="secondary">{participant.summary.headline}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{participant.summary.summary}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
