import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface ComparisonDimension {
  dimension: string;
  teamScore: number;
  benchmarkScore: number;
  difference: number;
  isAbove: boolean;
}

interface BenchmarkComparisonCardProps {
  data: ComparisonDimension[];
}

export function BenchmarkComparisonCard({ data }: BenchmarkComparisonCardProps) {
  if (data.length === 0) {
    return (
      <Card className="shadow-warm">
        <CardHeader>
          <CardTitle>Detalhamento por Dimensão</CardTitle>
          <CardDescription>Comparação com benchmark global</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground text-center">
            Aguardando diagnósticos concluídos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle>Detalhamento por Dimensão</CardTitle>
        <CardDescription>
          Comparação com a média global de todas as equipes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Dimensão
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                  Equipe
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                  Benchmark
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">
                  Diferença
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const isNeutral = Math.abs(item.difference) < 0.1;
                
                return (
                  <tr 
                    key={item.dimension} 
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <span className="font-medium text-foreground">
                        {item.dimension}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="font-semibold text-primary">
                        {item.teamScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="text-muted-foreground">
                        {item.benchmarkScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <div className="flex items-center justify-center gap-1">
                        {isNeutral ? (
                          <>
                            <Minus className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground font-medium">
                              {item.difference > 0 ? '+' : ''}{item.difference.toFixed(2)}
                            </span>
                          </>
                        ) : item.isAbove ? (
                          <>
                            <ArrowUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-500 font-medium">
                              +{item.difference.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowDown className="h-4 w-4 text-red-500" />
                            <span className="text-red-500 font-medium">
                              {item.difference.toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        <div className="mt-4 pt-4 border-t flex gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">
              {data.filter(d => d.difference >= 0.1).length} acima
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {data.filter(d => Math.abs(d.difference) < 0.1).length} na média
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-red-500" />
            <span className="text-muted-foreground">
              {data.filter(d => d.difference <= -0.1).length} abaixo
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
