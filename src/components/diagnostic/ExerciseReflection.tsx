import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Lightbulb } from "lucide-react";

interface ExerciseReflectionProps {
  onComplete: (insights: string) => void;
}

const PROMPTS = [
  "O que descobri sobre mim mesmo(a) durante este diagnóstico?",
  "Qual emoção foi mais presente enquanto respondia às perguntas?",
  "Qual área da minha vida precisa de mais atenção neste momento?",
  "Se pudesse dar um conselho ao meu 'eu' de um ano atrás, qual seria?"
];

export function ExerciseReflection({ onComplete }: ExerciseReflectionProps) {
  const [insights, setInsights] = useState("");
  const [activePrompt, setActivePrompt] = useState(0);

  const handleComplete = () => {
    onComplete(insights);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <PenLine className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Reflexão Guiada</CardTitle>
          <CardDescription>
            Reserve um momento para refletir sobre sua jornada
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Prompts de reflexão */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
              Perguntas para inspirar:
            </div>
            <div className="flex flex-wrap gap-2">
              {PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setActivePrompt(index)}
                  className={`text-sm px-3 py-1.5 rounded-full transition-colors ${activePrompt === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted-foreground/10"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <p className="text-sm bg-muted/50 p-3 rounded-lg italic">
              "{PROMPTS[activePrompt]}"
            </p>
          </div>

          {/* Área de texto */}
          <div className="space-y-2">
            <Textarea
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              placeholder="Escreva suas reflexões aqui... Este é um espaço seguro para você se expressar livremente."
              className="min-h-[200px] resize-none"
            />
            <p className="text-sm text-muted-foreground text-right">
              {insights.length} caracteres
            </p>
          </div>

          {/* Nota de privacidade */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              🔒 Suas reflexões são privadas e serão salvas de forma segura.
              Elas fazem parte do seu processo de autoconhecimento.
            </p>
          </div>

          {/* Botão */}
          <Button
            onClick={handleComplete}
            size="lg"
            className="w-full"
          >
            Finalizar e Ver Resultados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
