import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { DimensionScore } from "@/lib/diagnostic-scoring";

interface ResultsRadarChartProps {
  scores: DimensionScore[];
}

/**
 * Creates a short label for the radar chart axis.
 * Uses the first meaningful word(s) from the dimension name.
 */
function getShortLabel(dimension: string): string {
  const map: Record<string, string> = {
    "Consciência Interior": "Consciência",
    "Coerência Emocional": "Coerência",
    "Conexão e Propósito": "Propósito",
    "Relações e Compaixão": "Compaixão",
    "Transformação": "Transformação",
  };
  return map[dimension] || dimension.split(" ")[0];
}

export function ResultsRadarChart({ scores }: ResultsRadarChartProps) {
  const data = scores.map(s => ({
    dimension: getShortLabel(s.dimension),
    fullName: s.dimension,
    score: s.score,
    fullMark: 5
  }));

  return (
    <div className="w-full h-[300px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid 
            stroke="hsl(var(--muted-foreground))" 
            strokeOpacity={0.3}
          />
          <PolarAngleAxis 
            dataKey="dimension" 
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
          <Radar
            name="Seu Score"
            dataKey="score"
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
                      Score: {data.score.toFixed(1)} / 5
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
