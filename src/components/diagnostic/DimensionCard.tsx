import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { DimensionScore, getScoreLevel } from "@/lib/diagnostic-scoring";
import { getDimensionAbout, getInterpretation, getDimensionWhyItMatters, getDimensionColor } from "@/lib/dimension-descriptions";
import { Brain, Heart, Compass, Users, Sparkles, LucideIcon, ChevronDown, Lightbulb, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DimensionCardProps {
  score: DimensionScore;
  isWeak?: boolean;
  isStrong?: boolean;
  defaultOpen?: boolean;
}

const ICONS: Record<string, LucideIcon> = {
  "Consciência Interior": Brain,
  "Coerência Emocional": Heart,
  "Conexão e Propósito": Compass,
  "Relações e Compaixão": Users,
  "Transformação": Sparkles
};

export function DimensionCard({ score, isWeak, isStrong, defaultOpen = false }: DimensionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = ICONS[score.dimension] || Brain;
  const level = getScoreLevel(score.score);
  const about = getDimensionAbout(score.dimension);
  const interpretation = getInterpretation(score.dimension, score.score);
  const whyItMatters = getDimensionWhyItMatters(score.dimension);
  const colors = getDimensionColor(score.dimension);

  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (score.percentage / 100) * circumference;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "rounded-lg border border-border overflow-hidden transition-all shadow-warm-sm hover:shadow-warm",
        colors.border,
        "border-l-4"
      )}>
        {/* Header - always visible */}
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors">
            {/* Mini circular gauge */}
            <div className="relative flex-shrink-0">
              <svg width="48" height="48" viewBox="0 0 48 48" className="transform -rotate-90">
                <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                <circle
                  cx="24" cy="24" r="18"
                  fill="none"
                  className={colors.text}
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{score.score.toFixed(1)}</span>
              </div>
            </div>

            {/* Dimension info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4 flex-shrink-0", colors.text)} />
                <h4 className="font-semibold text-sm truncate">{score.dimension}</h4>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Progress
                  value={score.percentage}
                  className={cn("h-1.5 flex-1")}
                />
                <span className="text-xs text-muted-foreground flex-shrink-0">{Math.round(score.percentage)}%</span>
              </div>
            </div>

            {/* Badges + chevron */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isStrong && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">
                  Ponto forte
                </span>
              )}
              {isWeak && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap">
                  A desenvolver
                </span>
              )}
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )} />
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Expandable content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 space-y-3 animate-fade-in border-t border-border">
            {/* About */}
            <p className="text-sm text-muted-foreground pt-3">
              {about}
            </p>

            {/* Interpretation */}
            {interpretation && (
              <div className={cn("rounded-md p-3", colors.bgSubtle)}>
                <div className="flex gap-2">
                  <Quote className={cn("h-4 w-4 flex-shrink-0 mt-0.5", colors.text)} />
                  <p className="text-sm italic text-foreground/80">
                    {interpretation}
                  </p>
                </div>
              </div>
            )}

            {/* Why it matters */}
            {whyItMatters && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-accent" />
                <span><strong>Por que importa:</strong> {whyItMatters}</span>
              </div>
            )}

            {/* Level badge */}
            <div className="flex items-center justify-between pt-1">
              <span className={cn("text-xs font-medium", level.color)}>
                {level.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {score.score.toFixed(1)} de {score.maxScore}
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
