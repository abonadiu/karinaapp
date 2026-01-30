import React from "react";
import { Calendar } from "lucide-react";
import { PopupButton } from "react-calendly";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ScheduleFeedbackCardProps {
  calendlyUrl: string;
  participantName: string;
}

export function ScheduleFeedbackCard({ calendlyUrl, participantName }: ScheduleFeedbackCardProps) {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) return null;

  // Prefill com nome do participante
  const prefill = {
    name: participantName,
  };

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800">
      <CardHeader className="text-center">
        <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-fit mb-2">
          <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-green-800 dark:text-green-200">
          Agende sua Sessão de Feedback
        </CardTitle>
        <CardDescription className="text-green-700 dark:text-green-300">
          Aprofunde seus resultados com uma sessão individual com seu facilitador
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <PopupButton
          url={calendlyUrl}
          rootElement={rootElement}
          text="Agendar Sessão de Feedback"
          prefill={prefill}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
        />
        <p className="mt-4 text-sm text-green-600 dark:text-green-400">
          Escolha o melhor horário para conversar sobre seu desenvolvimento
        </p>
      </CardContent>
    </Card>
  );
}
