import { DiscDimensionScore } from "@/lib/disc-scoring";

interface DiscProfileChartProps {
  scores: DiscDimensionScore[];
  size?: "sm" | "md" | "lg";
}

export function DiscProfileChart({ scores, size = "md" }: DiscProfileChartProps) {
  const heights = {
    sm: 120,
    md: 200,
    lg: 280,
  };

  const barWidths = {
    sm: 40,
    md: 56,
    lg: 72,
  };

  const maxHeight = heights[size];
  const barWidth = barWidths[size];
  const gap = size === "sm" ? 12 : 20;
  const totalWidth = scores.length * barWidth + (scores.length - 1) * gap;

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-end justify-center"
        style={{ height: maxHeight + 40, gap }}
      >
        {scores.map((score) => {
          const barHeight = Math.max((score.percentage / 100) * maxHeight, 8);
          return (
            <div
              key={score.dimension}
              className="flex flex-col items-center"
              style={{ width: barWidth }}
            >
              {/* Percentage label */}
              <span
                className={`font-bold mb-1 ${
                  size === "sm" ? "text-xs" : "text-sm"
                }`}
                style={{ color: score.color }}
              >
                {Math.round(score.percentage)}%
              </span>

              {/* Bar */}
              <div
                className="rounded-t-lg transition-all duration-700 ease-out relative"
                style={{
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: score.color,
                  opacity: 0.85,
                }}
              >
                {/* Score inside bar */}
                {size !== "sm" && barHeight > 30 && (
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    {score.score.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Dimension letter */}
              <div
                className={`mt-2 font-bold rounded-full flex items-center justify-center ${
                  size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"
                }`}
                style={{
                  backgroundColor: score.color + "15",
                  color: score.color,
                }}
              >
                {score.dimension}
              </div>

              {/* Dimension name */}
              {size !== "sm" && (
                <span className="text-xs text-muted-foreground mt-1 text-center">
                  {score.dimensionLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
