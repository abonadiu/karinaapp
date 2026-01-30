import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from "recharts";

interface DimensionAverage {
  dimension: string;
  average: number;
}

interface AggregateRadarChartProps {
  data: DimensionAverage[];
}

export function AggregateRadarChart({ data }: AggregateRadarChartProps) {
  const chartData = data.map((d) => ({
    dimension: d.dimension.split(" ")[0], // First word for label
    fullName: d.dimension,
    average: d.average,
    fullMark: 5,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid 
            stroke="hsl(var(--muted-foreground))" 
            strokeOpacity={0.3}
          />
          <PolarAngleAxis 
            dataKey="dimension" 
            tick={{ 
              fill: "hsl(var(--foreground))", 
              fontSize: 12,
              fontWeight: 500
            }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 5]} 
            tickCount={6}
            tick={{ 
              fill: "hsl(var(--muted-foreground))", 
              fontSize: 10 
            }}
          />
          <Radar
            name="Média da Equipe"
            dataKey="average"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium">{data.fullName}</p>
                    <p className="text-primary font-bold">
                      Média: {data.average.toFixed(2)} / 5
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
