import React from "react";
import { generateActionPlan } from "@/lib/action-plan";
import { DimensionScore } from "@/lib/diagnostic-scoring";
import { getDimensionColor } from "@/lib/dimension-descriptions";
import { CalendarDays, Target, Sun, CloudSun, Moon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionPlanProps {
  dimensionScores: DimensionScore[];
}

const TIME_ICONS: Record<string, React.ElementType> = {
  "Manhã": Sun,
  "Tarde": CloudSun,
  "Noite": Moon,
};

export function ActionPlan({ dimensionScores }: ActionPlanProps) {
  const plan = generateActionPlan(dimensionScores);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Plano de Ação — 4 Semanas</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Um plano estruturado focado nas suas duas dimensões com maior potencial de desenvolvimento:{" "}
        <strong>{plan.focusDimensions[0]}</strong> e <strong>{plan.focusDimensions[1]}</strong>.
      </p>

      {plan.weeks.map((week, index) => {
        const dimName = plan.focusDimensions[index % 2 === 0 ? 0 : 1];
        const colors = getDimensionColor(dimName);

        return (
          <div key={index} className={cn(
            "rounded-lg border overflow-hidden border-l-4",
            colors.border
          )}>
            {/* Week header */}
            <div className="px-4 py-3 bg-muted/30 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">Semana {week.week} — {week.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Target className="h-3 w-3" />
                  {week.objective}
                </p>
              </div>
            </div>

            {/* Practices */}
            <div className="p-4 space-y-3">
              {week.practices.map((practice, pIndex) => {
                const TimeIcon = TIME_ICONS[practice.time] || Sun;
                return (
                  <div key={pIndex} className="flex items-start gap-3">
                    <div className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                      colors.bgSubtle
                    )}>
                      <TimeIcon className={cn("h-3.5 w-3.5", colors.text)} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{practice.time}</span>
                      <p className="text-sm text-foreground/85 leading-relaxed mt-0.5">{practice.activity}</p>
                    </div>
                  </div>
                );
              })}

              {/* Weekly goal */}
              <div className="rounded-md bg-muted/40 p-3 flex items-start gap-2 mt-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed">
                  <strong>Meta da semana:</strong> {week.weeklyGoal}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
