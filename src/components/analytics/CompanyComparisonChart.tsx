import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface CompanyData {
  name: string;
  average: number;
  participants: number;
}

interface CompanyComparisonChartProps {
  data: CompanyData[];
  isLoading: boolean;
}

const chartConfig: ChartConfig = {
  average: {
    label: "Média",
    color: "hsl(var(--primary))",
  },
};

export function CompanyComparisonChart({ data, isLoading }: CompanyComparisonChartProps) {
  // Sort by average descending and take top 10
  const sortedData = [...data]
    .sort((a, b) => b.average - a.average)
    .slice(0, 10);

  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle className="text-lg">Comparativo por Empresa</CardTitle>
        <CardDescription>Média de pontuação por empresa (top 10)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : sortedData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Sem dados para exibir
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart 
              data={sortedData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis 
                type="number" 
                domain={[0, 5]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={75}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number, name: string, item: any) => [
                  `${value.toFixed(2)} (${item.payload.participants} participantes)`,
                  "Média"
                ]}
              />
              <Bar 
                dataKey="average" 
                fill="var(--color-average)" 
                radius={[0, 4, 4, 0]}
                name="Média"
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
