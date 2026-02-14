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
        "rounded-xl border border-border overflow-hidden transition-all shadow-warm-sm hover:shadow-warm",
        colors.border,
        "border-l-4"
      )}>
        {/* Header - always visible */}
        <CollapsibleTrigger asChild>
          <button className="w-full p-5 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors">
            <div className="relative flex-shrink-0">
              <svg width="52" height="52" viewBox="0 0 52 52" className="transform -rotate-90">
                <circle cx="26" cy="26" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                <circle cx="26" cy="26" r="20" fill="none" className={colors.text} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={2 * Math.PI * 20} strokeDashoffset={(2 * Math.PI * 20) - (score.percentage / 100) * (2 * Math.PI * 20)} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{score.score.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-5 w-5 flex-shrink-0", colors.text)} />
                <h4 className="font-semibold text-base truncate">{score.dimension}</h4>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <Progress value={score.percentage} className="h-2 flex-1" />
                <span className="text-sm text-muted-foreground flex-shrink-0">{Math.round(score.percentage)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isStrong && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">Ponto forte</span>
              )}
              {isWeak && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap">A desenvolver</span>
              )}
              <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-5 pt-0 animate-fade-in border-t border-border">
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="w-full justify-start h-9 bg-muted/50">
                <TabsTrigger value="overview" className="text-sm gap-1.5 h-8"><Eye className="h-3.5 w-3.5" />Visão Geral</TabsTrigger>
                <TabsTrigger value="subdimensions" className="text-sm gap-1.5 h-8"><Layers className="h-3.5 w-3.5" />Subdimensões</TabsTrigger>
                <TabsTrigger value="result" className="text-sm gap-1.5 h-8"><Quote className="h-3.5 w-3.5" />Seu Resultado</TabsTrigger>
                <TabsTrigger value="practice" className="text-sm gap-1.5 h-8"><Lightbulb className="h-3.5 w-3.5" />Na Prática</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{about}</p>
                {theoreticalBasis && (
                  <div className="rounded-lg bg-muted/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">Fundamentação Teórica</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{theoreticalBasis}</p>
                  </div>
                )}
                {whyItMatters && (
                  <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
                    <span><strong>Por que importa:</strong> {whyItMatters}</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="subdimensions" className="space-y-3 mt-4">
                {subDimensions.map((sub, i) => (
                  <div key={i} className={cn("rounded-lg p-4 border-l-2", colors.border)}>
                    <h5 className="text-sm font-semibold mb-1.5">{sub.name}</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">{sub.description}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="result" className="space-y-4 mt-4">
                {interpretation && (
                  <div className={cn("rounded-lg p-4", colors.bgSubtle)}>
                    <div className="flex gap-2.5">
                      <Quote className={cn("h-5 w-5 flex-shrink-0 mt-0.5", colors.text)} />
                      <p className="text-sm text-foreground/80 leading-relaxed">{interpretation}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className={cn("text-sm font-medium", level.color)}>{level.label}</span>
                  <span className="text-sm text-muted-foreground">{score.score.toFixed(1)} de {score.maxScore}</span>
                </div>
                {connectionToOthers && (
                  <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Link2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                    <span><strong>Conexão com outras dimensões:</strong> {connectionToOthers}</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="practice" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground mb-2">Sinais desta dimensão no dia a dia:</p>
                {signsInDailyLife.map((sign, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={cn("flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5", colors.bgSubtle, colors.text)}>{i + 1}</span>
                    <span className="text-foreground/85 leading-relaxed text-sm">{sign}</span>
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
