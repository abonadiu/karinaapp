import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface DimensionData {
  dimension: string;
  shortName: string;
  average: number;
}

interface GlobalRadarChartProps {
  data: DimensionData[];
  isLoading: boolean;
}

const chartConfig: ChartConfig = {
  average: {
    label: "Média Global",
    color: "hsl(var(--primary))",
  },
};

export function GlobalRadarChart({ data, isLoading }: GlobalRadarChartProps) {
  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle className="text-lg">Perfil Médio Global</CardTitle>
        <CardDescription>Média de todas as dimensões dos diagnósticos concluídos</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            Sem dados para exibir
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis 
                dataKey="shortName" 
                tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 5]}
                tick={{ fontSize: 10 }}
                tickCount={6}
              />
              <Radar
                name="Média Global"
                dataKey="average"
                stroke="var(--color-average)"
                fill="var(--color-average)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
