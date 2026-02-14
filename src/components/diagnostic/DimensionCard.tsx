import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { DimensionScore, getScoreLevel } from "@/lib/diagnostic-scoring";
import { getDimensionAbout, getInterpretation, getDimensionWhyItMatters, getDimensionColor, getDimensionTheoreticalBasis, getDimensionSubDimensions, getDimensionSignsInDailyLife, getDimensionConnectionToOthers } from "@/lib/dimension-descriptions";
import { Brain, Heart, Compass, Users, Sparkles, LucideIcon, ChevronDown, Lightbulb, Quote, BookOpen, Layers, Eye, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const theoreticalBasis = getDimensionTheoreticalBasis(score.dimension);
  const subDimensions = getDimensionSubDimensions(score.dimension);
  const signsInDailyLife = getDimensionSignsInDailyLife(score.dimension);
  const connectionToOthers = getDimensionConnectionToOthers(score.dimension);
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
            <div className="relative flex-shrink-0">
              <svg width="48" height="48" viewBox="0 0 48 48" className="transform -rotate-90">
                <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                <circle cx="24" cy="24" r="18" fill="none" className={colors.text} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{score.score.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4 flex-shrink-0", colors.text)} />
                <h4 className="font-semibold text-sm truncate">{score.dimension}</h4>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={score.percentage} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground flex-shrink-0">{Math.round(score.percentage)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isStrong && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">Ponto forte</span>
              )}
              {isWeak && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap">A desenvolver</span>
              )}
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 animate-fade-in border-t border-border">
            <Tabs defaultValue="overview" className="mt-3">
              <TabsList className="w-full justify-start h-8 bg-muted/50">
                <TabsTrigger value="overview" className="text-xs gap-1 h-7"><Eye className="h-3 w-3" />Visão Geral</TabsTrigger>
                <TabsTrigger value="subdimensions" className="text-xs gap-1 h-7"><Layers className="h-3 w-3" />Subdimensões</TabsTrigger>
                <TabsTrigger value="result" className="text-xs gap-1 h-7"><Quote className="h-3 w-3" />Seu Resultado</TabsTrigger>
                <TabsTrigger value="practice" className="text-xs gap-1 h-7"><Lightbulb className="h-3 w-3" />Na Prática</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3 mt-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{about}</p>
                {theoreticalBasis && (
                  <div className="rounded-md bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">Fundamentação Teórica</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{theoreticalBasis}</p>
                  </div>
                )}
                {whyItMatters && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-accent" />
                    <span><strong>Por que importa:</strong> {whyItMatters}</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="subdimensions" className="space-y-2 mt-3">
                {subDimensions.map((sub, i) => (
                  <div key={i} className={cn("rounded-md p-3 border-l-2", colors.border)}>
                    <h5 className="text-xs font-semibold mb-1">{sub.name}</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">{sub.description}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="result" className="space-y-3 mt-3">
                {interpretation && (
                  <div className={cn("rounded-md p-3", colors.bgSubtle)}>
                    <div className="flex gap-2">
                      <Quote className={cn("h-4 w-4 flex-shrink-0 mt-0.5", colors.text)} />
                      <p className="text-sm text-foreground/80 leading-relaxed">{interpretation}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className={cn("text-xs font-medium", level.color)}>{level.label}</span>
                  <span className="text-xs text-muted-foreground">{score.score.toFixed(1)} de {score.maxScore}</span>
                </div>
                {connectionToOthers && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Link2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-primary" />
                    <span><strong>Conexão com outras dimensões:</strong> {connectionToOthers}</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="practice" className="space-y-2 mt-3">
                <p className="text-xs text-muted-foreground mb-2">Sinais desta dimensão no dia a dia:</p>
                {signsInDailyLife.map((sign, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={cn("flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5", colors.bgSubtle, colors.text)}>{i + 1}</span>
                    <span className="text-foreground/85 leading-relaxed text-xs">{sign}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
