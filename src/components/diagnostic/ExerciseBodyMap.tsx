import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseBodyMapProps {
  onComplete: (tensionAreas: string[], comfortAreas: string[]) => void;
  onSkip: () => void;
}

interface BodyArea {
  id: string;
  name: string;
  path: string;
}

const BODY_AREAS: BodyArea[] = [
  { id: "head", name: "Cabeça", path: "M100,30 a20,20 0 1,0 0.1,0" },
  { id: "neck", name: "Pescoço", path: "M95,50 L105,50 L105,65 L95,65 Z" },
  { id: "shoulders", name: "Ombros", path: "M60,65 L140,65 L140,80 L60,80 Z" },
  { id: "chest", name: "Peito", path: "M75,80 L125,80 L125,120 L75,120 Z" },
  { id: "stomach", name: "Abdômen", path: "M80,120 L120,120 L120,160 L80,160 Z" },
  { id: "leftArm", name: "Braço Esquerdo", path: "M60,80 L75,80 L70,140 L55,140 Z" },
  { id: "rightArm", name: "Braço Direito", path: "M125,80 L140,80 L145,140 L130,140 Z" },
  { id: "hands", name: "Mãos", path: "M50,140 L70,140 L68,160 L52,160 Z M130,140 L150,140 L148,160 L132,160 Z" },
  { id: "hips", name: "Quadril", path: "M75,160 L125,160 L130,180 L70,180 Z" },
  { id: "legs", name: "Pernas", path: "M70,180 L95,180 L90,250 L65,250 Z M105,180 L130,180 L135,250 L110,250 Z" },
  { id: "feet", name: "Pés", path: "M60,250 L95,250 L95,270 L60,270 Z M105,250 L140,250 L140,270 L105,270 Z" }
];

type SelectionMode = "tension" | "comfort";

export function ExerciseBodyMap({ onComplete, onSkip }: ExerciseBodyMapProps) {
  const [mode, setMode] = useState<SelectionMode>("tension");
  const [tensionAreas, setTensionAreas] = useState<Set<string>>(new Set());
  const [comfortAreas, setComfortAreas] = useState<Set<string>>(new Set());

  const handleAreaClick = (areaId: string) => {
    if (mode === "tension") {
      setTensionAreas(prev => {
        const newSet = new Set(prev);
        if (newSet.has(areaId)) {
          newSet.delete(areaId);
        } else {
          newSet.add(areaId);
          // Remover de comfort se estiver lá
          setComfortAreas(c => {
            const updated = new Set(c);
            updated.delete(areaId);
            return updated;
          });
        }
        return newSet;
      });
    } else {
      setComfortAreas(prev => {
        const newSet = new Set(prev);
        if (newSet.has(areaId)) {
          newSet.delete(areaId);
        } else {
          newSet.add(areaId);
          // Remover de tension se estiver lá
          setTensionAreas(t => {
            const updated = new Set(t);
            updated.delete(areaId);
            return updated;
          });
        }
        return newSet;
      });
    }
  };

  const handleContinue = () => {
    if (mode === "tension") {
      setMode("comfort");
    } else {
      onComplete(Array.from(tensionAreas), Array.from(comfortAreas));
    }
  };

  const getAreaColor = (areaId: string) => {
    if (tensionAreas.has(areaId)) return "fill-red-400 stroke-red-600";
    if (comfortAreas.has(areaId)) return "fill-green-400 stroke-green-600";
    return "fill-muted stroke-muted-foreground/30 hover:fill-muted-foreground/20";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Mapeamento Corporal</CardTitle>
          <CardDescription>
            {mode === "tension" 
              ? "Toque nas áreas onde você sente TENSÃO ou desconforto"
              : "Agora, toque nas áreas onde você sente CONFORTO ou bem-estar"
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Legenda */}
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-400" />
              <span>Tensão</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-400" />
              <span>Conforto</span>
            </div>
          </div>

          {/* SVG do corpo */}
          <div className="flex justify-center">
            <svg 
              viewBox="0 0 200 280" 
              className="w-48 h-72"
            >
              {BODY_AREAS.map(area => (
                <path
                  key={area.id}
                  d={area.path}
                  className={cn(
                    "cursor-pointer transition-colors stroke-2",
                    getAreaColor(area.id)
                  )}
                  onClick={() => handleAreaClick(area.id)}
                >
                  <title>{area.name}</title>
                </path>
              ))}
            </svg>
          </div>

          {/* Lista de selecionados */}
          <div className="space-y-2">
            {tensionAreas.size > 0 && (
              <div className="text-sm">
                <span className="font-medium text-red-600">Tensão: </span>
                <span className="text-muted-foreground">
                  {Array.from(tensionAreas)
                    .map(id => BODY_AREAS.find(a => a.id === id)?.name)
                    .join(", ")}
                </span>
              </div>
            )}
            {comfortAreas.size > 0 && (
              <div className="text-sm">
                <span className="font-medium text-green-600">Conforto: </span>
                <span className="text-muted-foreground">
                  {Array.from(comfortAreas)
                    .map(id => BODY_AREAS.find(a => a.id === id)?.name)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Modo atual */}
          <div className={cn(
            "text-center py-2 px-4 rounded-lg text-sm font-medium",
            mode === "tension" 
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          )}>
            {mode === "tension" 
              ? "Marque as áreas de TENSÃO"
              : "Marque as áreas de CONFORTO"
            }
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-center">
            <Button onClick={handleContinue} size="lg">
              {mode === "tension" ? "Próximo" : "Continuar"}
            </Button>
            <Button variant="ghost" onClick={onSkip} className="gap-2">
              <SkipForward className="h-4 w-4" />
              Pular
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
