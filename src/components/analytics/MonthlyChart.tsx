import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlyData {
  month: string;
  created: number;
  completed: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
  isLoading: boolean;
}

const chartConfig: ChartConfig = {
  created: {
    label: "Cadastrados",
    color: "hsl(var(--primary))",
  },
  completed: {
    label: "Concluídos",
    color: "hsl(var(--success))",
  },
};

export function MonthlyChart({ data, isLoading }: MonthlyChartProps) {
  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle className="text-lg">Evolução Mensal</CardTitle>
        <CardDescription>Participantes cadastrados vs concluídos por mês</CardDescription>
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
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="created"
                stroke="var(--color-created)"
                strokeWidth={2}
                dot={{ fill: "var(--color-created)", strokeWidth: 2 }}
                name="Cadastrados"
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="var(--color-completed)"
                strokeWidth={2}
                dot={{ fill: "var(--color-completed)", strokeWidth: 2 }}
                name="Concluídos"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
