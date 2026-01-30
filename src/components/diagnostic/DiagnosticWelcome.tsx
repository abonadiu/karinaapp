import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, Compass, Users, Sparkles, Clock, CheckCircle } from "lucide-react";

interface DiagnosticWelcomeProps {
  participantName: string;
  onStart: () => void;
}

const dimensions = [
  { icon: Brain, name: "Consciência Interior", color: "text-purple-500" },
  { icon: Heart, name: "Coerência Emocional", color: "text-red-500" },
  { icon: Compass, name: "Conexão e Propósito", color: "text-blue-500" },
  { icon: Users, name: "Relações e Compaixão", color: "text-green-500" },
  { icon: Sparkles, name: "Transformação", color: "text-amber-500" },
];

export function DiagnosticWelcome({ participantName, onStart }: DiagnosticWelcomeProps) {
  const firstName = participantName.split(" ")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold">
            Olá, {firstName}! 👋
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Bem-vindo(a) ao Diagnóstico de Inteligência Emocional e Espiritual
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-center">
            Este diagnóstico foi desenvolvido para ajudá-lo(a) a compreender melhor 
            suas fortalezas e áreas de desenvolvimento em 5 dimensões fundamentais:
          </p>

          <div className="grid gap-3">
            {dimensions.map((dim, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <dim.icon className={`h-5 w-5 ${dim.color}`} />
                <span className="font-medium">{dim.name}</span>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              O que esperar:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                <span>40 perguntas reflexivas (cerca de 15 minutos)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                <span>3 exercícios vivenciais curtos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                <span>Relatório personalizado com recomendações</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                <span>Você pode pausar e retomar quando quiser</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Dica:</strong> Responda com honestidade, sem pensar muito. 
              A primeira resposta que vier à mente geralmente é a mais autêntica. 
              Não existem respostas certas ou erradas.
            </p>
          </div>

          <Button 
            onClick={onStart} 
            size="lg" 
            className="w-full text-lg py-6"
          >
            Iniciar Diagnóstico
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
