import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Play, Pause, SkipForward, CheckCircle } from "lucide-react";

interface ExerciseBreathingProps {
  onComplete: (duration: number) => void;
  onSkip: () => void;
}

type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

const PHASE_DURATIONS = {
  inhale: 4,
  hold: 7,
  exhale: 8,
  rest: 2
};

const PHASE_LABELS = {
  inhale: "Inspire",
  hold: "Segure",
  exhale: "Expire",
  rest: "Descanse"
};

const TOTAL_CYCLES = 3;

export function ExerciseBreathing({ onComplete, onSkip }: ExerciseBreathingProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [phaseTime, setPhaseTime] = useState(PHASE_DURATIONS.inhale);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [totalTime, setTotalTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const getNextPhase = useCallback((current: BreathPhase): BreathPhase => {
    switch (current) {
      case "inhale": return "hold";
      case "hold": return "exhale";
      case "exhale": return "rest";
      case "rest": return "inhale";
    }
  }, []);

  useEffect(() => {
    if (!isRunning || isComplete) return;

    const interval = setInterval(() => {
      setTotalTime(prev => prev + 1);
      setPhaseTime(prev => {
        if (prev <= 1) {
          const nextPhase = getNextPhase(phase);
          
          // Verificar se completou um ciclo
          if (phase === "rest" && nextPhase === "inhale") {
            if (currentCycle >= TOTAL_CYCLES) {
              setIsComplete(true);
              setIsRunning(false);
              return 0;
            }
            setCurrentCycle(c => c + 1);
          }
          
          setPhase(nextPhase);
          return PHASE_DURATIONS[nextPhase];
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phase, currentCycle, isComplete, getNextPhase]);

  const handleStart = () => {
    setIsRunning(true);
    setPhase("inhale");
    setPhaseTime(PHASE_DURATIONS.inhale);
    setCurrentCycle(1);
    setTotalTime(0);
    setIsComplete(false);
  };

  const handlePause = () => {
    setIsRunning(prev => !prev);
  };

  const handleComplete = () => {
    onComplete(totalTime);
  };

  const getCircleScale = () => {
    switch (phase) {
      case "inhale": return "scale-125";
      case "hold": return "scale-125";
      case "exhale": return "scale-100";
      case "rest": return "scale-100";
    }
  };

  const getCircleColor = () => {
    switch (phase) {
      case "inhale": return "bg-blue-500";
      case "hold": return "bg-purple-500";
      case "exhale": return "bg-green-500";
      case "rest": return "bg-amber-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Wind className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Exercício de Respiração</CardTitle>
          <CardDescription>
            Técnica 4-7-8 para acalmar a mente e centrar-se
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {!isRunning && !isComplete && totalTime === 0 && (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Este exercício ajuda a regular o sistema nervoso e preparar 
                você para uma reflexão mais profunda.
              </p>
              <div className="bg-muted rounded-lg p-4 text-sm space-y-2">
                <p><strong>4 segundos:</strong> Inspire pelo nariz</p>
                <p><strong>7 segundos:</strong> Segure a respiração</p>
                <p><strong>8 segundos:</strong> Expire pela boca</p>
                <p className="text-muted-foreground pt-2">
                  Faremos {TOTAL_CYCLES} ciclos completos
                </p>
              </div>
            </div>
          )}

          {(isRunning || (totalTime > 0 && !isComplete)) && (
            <div className="flex flex-col items-center space-y-6">
              {/* Círculo animado */}
              <div className="relative">
                <div 
                  className={`w-48 h-48 rounded-full ${getCircleColor()} opacity-20 transition-transform duration-1000 ${getCircleScale()}`}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{phaseTime}</span>
                  <span className="text-lg font-medium text-muted-foreground">
                    {PHASE_LABELS[phase]}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Ciclo {currentCycle} de {TOTAL_CYCLES}
                </p>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="text-center space-y-4">
              <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-lg font-medium">Exercício concluído!</p>
              <p className="text-muted-foreground">
                Você praticou por {Math.floor(totalTime / 60)}:{String(totalTime % 60).padStart(2, '0')} minutos.
                Como está se sentindo?
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 justify-center">
            {!isRunning && !isComplete && totalTime === 0 && (
              <>
                <Button onClick={handleStart} size="lg" className="gap-2">
                  <Play className="h-4 w-4" />
                  Iniciar
                </Button>
                <Button variant="ghost" onClick={onSkip} className="gap-2">
                  <SkipForward className="h-4 w-4" />
                  Pular
                </Button>
              </>
            )}

            {isRunning && (
              <Button variant="outline" onClick={handlePause} className="gap-2">
                <Pause className="h-4 w-4" />
                Pausar
              </Button>
            )}

            {!isRunning && totalTime > 0 && !isComplete && (
              <>
                <Button onClick={handlePause} className="gap-2">
                  <Play className="h-4 w-4" />
                  Continuar
                </Button>
                <Button variant="ghost" onClick={onSkip}>
                  Pular
                </Button>
              </>
            )}

            {isComplete && (
              <Button onClick={handleComplete} size="lg">
                Continuar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
