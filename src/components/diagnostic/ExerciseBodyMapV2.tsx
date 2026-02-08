import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, SkipForward, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface BodySelection {
  areaId: string;
  type: "tension" | "comfort";
  intensity: 1 | 2 | 3;
}

interface ExerciseBodyMapV2Props {
  onComplete: (selections: BodySelection[]) => void;
  onSkip: () => void;
}

interface BodyArea {
  id: string;
  name: string;
  region: string;
  path: string;
  cx?: number;
  cy?: number;
}

// SVG paths for detailed anatomical silhouette
const BODY_AREAS: BodyArea[] = [
  // Head region
  { id: "forehead", name: "Testa", region: "head", path: "M85,15 Q100,5 115,15 L115,30 L85,30 Z" },
  { id: "eyes", name: "Olhos", region: "head", path: "M85,30 L115,30 L115,42 L85,42 Z" },
  { id: "jaw", name: "Mandíbula", region: "head", path: "M88,42 Q100,55 112,42 L112,52 Q100,62 88,52 Z" },
  { id: "nape", name: "Nuca", region: "neck", path: "M92,52 L108,52 L108,68 L92,68 Z" },
  
  // Upper body
  { id: "left_shoulder", name: "Ombro Esquerdo", region: "upper", path: "M55,68 L80,68 L80,85 L55,85 Z" },
  { id: "right_shoulder", name: "Ombro Direito", region: "upper", path: "M120,68 L145,68 L145,85 L120,85 Z" },
  { id: "trapezius", name: "Trapézio", region: "upper", path: "M80,68 L120,68 L120,85 L80,85 Z" },
  { id: "chest", name: "Peito", region: "upper", path: "M75,85 L125,85 L125,120 L75,120 Z" },
  { id: "upper_back", name: "Costas Alta", region: "upper", path: "M78,88 L122,88 L122,118 L78,118 Z", cx: 100, cy: 103 },
  
  // Arms
  { id: "left_arm", name: "Braço Esquerdo", region: "arms", path: "M45,85 L55,85 L55,130 L45,130 Z" },
  { id: "right_arm", name: "Braço Direito", region: "arms", path: "M145,85 L155,85 L155,130 L145,130 Z" },
  { id: "left_forearm", name: "Antebraço Esquerdo", region: "arms", path: "M42,130 L52,130 L50,175 L40,175 Z" },
  { id: "right_forearm", name: "Antebraço Direito", region: "arms", path: "M148,130 L158,130 L160,175 L150,175 Z" },
  { id: "left_hand", name: "Mão Esquerda", region: "arms", path: "M38,175 L52,175 L52,195 L38,195 Z" },
  { id: "right_hand", name: "Mão Direita", region: "arms", path: "M148,175 L162,175 L162,195 L148,195 Z" },
  
  // Core
  { id: "abdomen", name: "Abdômen", region: "core", path: "M78,120 L122,120 L122,155 L78,155 Z" },
  { id: "lower_back", name: "Lombar", region: "core", path: "M80,145 L120,145 L120,165 L80,165 Z", cx: 100, cy: 155 },
  { id: "hips", name: "Quadril", region: "core", path: "M70,155 L130,155 L135,175 L65,175 Z" },
  
  // Legs
  { id: "left_thigh", name: "Coxa Esquerda", region: "legs", path: "M68,175 L92,175 L88,230 L65,230 Z" },
  { id: "right_thigh", name: "Coxa Direita", region: "legs", path: "M108,175 L132,175 L135,230 L112,230 Z" },
  { id: "left_knee", name: "Joelho Esquerdo", region: "legs", path: "M65,230 L88,230 L86,250 L63,250 Z" },
  { id: "right_knee", name: "Joelho Direito", region: "legs", path: "M112,230 L135,230 L137,250 L114,250 Z" },
  { id: "left_calf", name: "Panturrilha Esquerda", region: "legs", path: "M63,250 L86,250 L82,310 L60,310 Z" },
  { id: "right_calf", name: "Panturrilha Direita", region: "legs", path: "M114,250 L137,250 L140,310 L118,310 Z" },
  { id: "left_foot", name: "Pé Esquerdo", region: "legs", path: "M55,310 L85,310 L85,330 L55,330 Z" },
  { id: "right_foot", name: "Pé Direito", region: "legs", path: "M115,310 L145,310 L145,330 L115,330 Z" },
];

type SelectionMode = "tension" | "comfort";

export function ExerciseBodyMapV2({ onComplete, onSkip }: ExerciseBodyMapV2Props) {
  const [mode, setMode] = useState<SelectionMode>("tension");
  const [selections, setSelections] = useState<Map<string, BodySelection>>(new Map());
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  const handleAreaClick = (areaId: string) => {
    setSelections(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(areaId);

      if (!existing) {
        // First click: intensity 1
        newMap.set(areaId, { areaId, type: mode, intensity: 1 });
      } else if (existing.type === mode) {
        // Same mode: cycle intensity
        if (existing.intensity < 3) {
          newMap.set(areaId, { ...existing, intensity: (existing.intensity + 1) as 1 | 2 | 3 });
        } else {
          // 4th click: remove
          newMap.delete(areaId);
        }
      } else {
        // Different mode: replace with new mode at intensity 1
        newMap.set(areaId, { areaId, type: mode, intensity: 1 });
      }

      return newMap;
    });
  };

  const handleContinue = () => {
    if (mode === "tension") {
      setMode("comfort");
    } else {
      onComplete(Array.from(selections.values()));
    }
  };

  const getAreaColor = (areaId: string) => {
    const selection = selections.get(areaId);
    const isHovered = hoveredArea === areaId;
    
    if (!selection) {
      return cn(
        "fill-muted stroke-muted-foreground/30 transition-all duration-200",
        isHovered && "fill-muted-foreground/20 stroke-muted-foreground/50"
      );
    }

    const { type, intensity } = selection;
    
    if (type === "tension") {
      const colors = {
        1: "fill-yellow-300 stroke-yellow-500",
        2: "fill-orange-400 stroke-orange-600",
        3: "fill-red-500 stroke-red-700",
      };
      return cn(colors[intensity], "transition-all duration-200", isHovered && "brightness-110");
    } else {
      const colors = {
        1: "fill-green-200 stroke-green-400",
        2: "fill-green-400 stroke-green-600",
        3: "fill-green-600 stroke-green-800",
      };
      return cn(colors[intensity], "transition-all duration-200", isHovered && "brightness-110");
    }
  };

  const getSelectionsByType = (type: SelectionMode) => {
    return Array.from(selections.values()).filter(s => s.type === type);
  };

  const getIntensityLabel = (intensity: number) => {
    const labels = { 1: "Leve", 2: "Moderado", 3: "Intenso" };
    return labels[intensity as 1 | 2 | 3];
  };

  const tensionSelections = getSelectionsByType("tension");
  const comfortSelections = getSelectionsByType("comfort");

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Mapeamento Corporal</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              {mode === "tension" 
                ? "Clique nas áreas onde você sente TENSÃO ou desconforto"
                : "Agora, clique nas áreas onde você sente CONFORTO ou bem-estar"
              }
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Clique 1x = Leve, 2x = Moderado, 3x = Intenso, 4x = Remove</p>
                </TooltipContent>
              </Tooltip>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-300" title="Leve" />
                  <div className="w-3 h-3 rounded bg-orange-400" title="Moderado" />
                  <div className="w-3 h-3 rounded bg-red-500" title="Intenso" />
                </div>
                <span>Tensão</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded bg-green-200" title="Leve" />
                  <div className="w-3 h-3 rounded bg-green-400" title="Moderado" />
                  <div className="w-3 h-3 rounded bg-green-600" title="Intenso" />
                </div>
                <span>Conforto</span>
              </div>
            </div>

            {/* Body SVG */}
            <div className="flex justify-center">
              <svg 
                viewBox="0 0 200 340" 
                className="w-56 h-80 md:w-64 md:h-96"
              >
                {/* Body outline for context */}
                <ellipse 
                  cx="100" cy="32" rx="25" ry="28" 
                  className="fill-none stroke-muted-foreground/20 stroke-1"
                />
                <path 
                  d="M75,60 L55,68 L45,85 L40,175 L55,195 L55,195 L65,175 L70,155 L68,175 L65,230 L60,310 L55,330 L85,330 L88,310 L92,175 L100,165 L108,175 L112,310 L115,330 L145,330 L140,310 L135,230 L132,175 L130,155 L130,175 L145,195 L160,175 L155,85 L145,68 L125,60 Z"
                  className="fill-none stroke-muted-foreground/20 stroke-1"
                />
                
                {/* Interactive body areas */}
                {BODY_AREAS.map(area => (
                  <Tooltip key={area.id}>
                    <TooltipTrigger asChild>
                      <path
                        d={area.path}
                        className={cn(
                          "cursor-pointer stroke-2",
                          getAreaColor(area.id),
                          selections.get(area.id) && "animate-pulse"
                        )}
                        onClick={() => handleAreaClick(area.id)}
                        onMouseEnter={() => setHoveredArea(area.id)}
                        onMouseLeave={() => setHoveredArea(null)}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-sm">
                      <p className="font-medium">{area.name}</p>
                      {selections.get(area.id) && (
                        <p className="text-xs text-muted-foreground">
                          {selections.get(area.id)?.type === "tension" ? "Tensão" : "Conforto"} - {getIntensityLabel(selections.get(area.id)!.intensity)}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </svg>
            </div>

            {/* Selected areas summary */}
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {tensionSelections.length > 0 && (
                <div className="text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                  <span className="font-medium text-red-600 dark:text-red-400">Tensão: </span>
                  <span className="text-muted-foreground">
                    {tensionSelections
                      .map(s => {
                        const area = BODY_AREAS.find(a => a.id === s.areaId);
                        return `${area?.name} (${getIntensityLabel(s.intensity)})`;
                      })
                      .join(", ")}
                  </span>
                </div>
              )}
              {comfortSelections.length > 0 && (
                <div className="text-sm bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                  <span className="font-medium text-green-600 dark:text-green-400">Conforto: </span>
                  <span className="text-muted-foreground">
                    {comfortSelections
                      .map(s => {
                        const area = BODY_AREAS.find(a => a.id === s.areaId);
                        return `${area?.name} (${getIntensityLabel(s.intensity)})`;
                      })
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Current mode indicator */}
            <div className={cn(
              "text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors",
              mode === "tension" 
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            )}>
              {mode === "tension" 
                ? "📍 Marque as áreas de TENSÃO (clique múltiplas vezes para intensidade)"
                : "✨ Marque as áreas de CONFORTO (clique múltiplas vezes para intensidade)"
              }
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <Button onClick={handleContinue} size="lg">
                {mode === "tension" ? "Próximo: Conforto" : "Continuar"}
              </Button>
              <Button variant="ghost" onClick={onSkip} className="gap-2">
                <SkipForward className="h-4 w-4" />
                Pular
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
