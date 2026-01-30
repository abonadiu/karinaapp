import React, { useEffect, useState } from "react";
import { Loader2, Brain, Heart, Compass, Users, Sparkles } from "lucide-react";

const STEPS = [
  { icon: Brain, text: "Analisando consciência interior..." },
  { icon: Heart, text: "Avaliando coerência emocional..." },
  { icon: Compass, text: "Medindo conexão e propósito..." },
  { icon: Users, text: "Calculando relações e compaixão..." },
  { icon: Sparkles, text: "Processando transformação..." },
];

export function ProcessingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % STEPS.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = STEPS[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/20 animate-ping" />
          </div>
          <div className="relative bg-background rounded-full p-6 shadow-lg">
            <CurrentIcon className="h-16 w-16 text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Processando seus resultados</h2>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {STEPS[currentStep].text}
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
