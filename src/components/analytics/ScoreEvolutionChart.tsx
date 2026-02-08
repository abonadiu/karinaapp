import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface ScoreEvolutionData {
  month: string;
  average: number;
  count: number;
}

interface ScoreEvolutionChartProps {
  data: ScoreEvolutionData[];
  isLoading: boolean;
}

const chartConfig: ChartConfig = {
  average: {
    label: "Média de Score",
    color: "hsl(var(--primary))",
  },
};

export function ScoreEvolutionChart({ data, isLoading }: ScoreEvolutionChartProps) {
  // Calculate global average for reference line
  const globalAverage = data.length > 0
    ? data.reduce((sum, d) => sum + d.average * d.count, 0) / 
      data.reduce((sum, d) => sum + d.count, 0)
    : 0;

  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle className="text-lg">Evolução de Scores</CardTitle>
        <CardDescription>
          Média de pontuação por mês de conclusão
          {globalAverage > 0 && (
            <span className="ml-2 text-primary font-medium">
              (Média geral: {globalAverage.toFixed(2)})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Sem dados para exibir
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name, props) => (
                      <div className="flex flex-col gap-1">
                        <span>Média: {Number(value).toFixed(2)}</span>
                        <span className="text-muted-foreground text-xs">
                          {props.payload?.count} diagnóstico(s)
                        </span>
                      </div>
                    )}
                  />
                } 
              />
              {globalAverage > 0 && (
                <ReferenceLine 
                  y={globalAverage} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  label={{
                    value: "Média",
                    position: "insideTopRight",
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="average"
                stroke="var(--color-average)"
                strokeWidth={2}
                dot={{ fill: "var(--color-average)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Média"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
