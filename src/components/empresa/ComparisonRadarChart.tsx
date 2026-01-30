import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

interface ComparisonData {
  dimension: string;
  shortName: string;
  team: number;
  benchmark: number;
}

interface ComparisonRadarChartProps {
  data: ComparisonData[];
}

export function ComparisonRadarChart({ data }: ComparisonRadarChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    fullMark: 5,
  }));

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
          <PolarGrid 
            stroke="hsl(var(--muted-foreground))" 
            strokeOpacity={0.3}
          />
          <PolarAngleAxis 
            dataKey="shortName" 
            tick={{ 
              fill: "hsl(var(--foreground))", 
              fontSize: 11,
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
          {/* Benchmark layer (behind) */}
          <Radar
            name="Benchmark Global"
            dataKey="benchmark"
            stroke="hsl(var(--muted-foreground))"
            fill="hsl(var(--muted-foreground))"
            fillOpacity={0.15}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          {/* Team layer (front) */}
          <Radar
            name="Sua Equipe"
            dataKey="team"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend 
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value) => (
              <span className="text-foreground text-sm">{value}</span>
            )}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
                    <p className="font-medium text-foreground">{data.dimension}</p>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm">Equipe: <strong>{data.team.toFixed(2)}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-muted-foreground" />
                      <span className="text-sm">Benchmark: <strong>{data.benchmark.toFixed(2)}</strong></span>
                    </div>
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
