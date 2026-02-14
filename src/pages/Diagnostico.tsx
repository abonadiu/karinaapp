import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDiagnostic } from "@/hooks/useDiagnostic";
import { DiagnosticWelcome } from "@/components/diagnostic/DiagnosticWelcome";
import { QuestionCard } from "@/components/diagnostic/QuestionCard";
import { ExerciseBreathing } from "@/components/diagnostic/ExerciseBreathing";
import { ExerciseBodyMapV2 } from "@/components/diagnostic/ExerciseBodyMapV2";
import { ExerciseReflection } from "@/components/diagnostic/ExerciseReflection";
import { ProcessingScreen } from "@/components/diagnostic/ProcessingScreen";
import { DiagnosticResults } from "@/components/diagnostic/DiagnosticResults";
import { DiscResults } from "@/components/disc/DiscResults";
import { SoulPlanNameInput } from "@/components/soul-plan/SoulPlanNameInput";
import { SoulPlanResults } from "@/components/soul-plan/SoulPlanResults";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Diagnostico() {
  const { token } = useParams<{ token: string }>();
  
  const {
    loading,
    error,
    participant,
    facilitatorProfile,
    questions,
    responses,
    currentQuestionIndex,
    currentQuestion,
    step,
    scores,
    discScores,
    soulPlanResult,
    existingResult,
    testTypeSlug,
    isDiscTest,
    isSoulPlanTest,
    startDiagnostic,
    answerQuestion,
    previousQuestion,
    completeBreathingExercise,
    completeBodyMapExercise,
    completeReflectionExercise,
    submitSoulPlanName,
    skipExercise
  } = useDiagnostic(token || "");

  // Aplicar branding do facilitador via CSS variables
  useEffect(() => {
    if (facilitatorProfile) {
      const root = document.documentElement;
      
      if (facilitatorProfile.primary_color) {
        root.style.setProperty('--brand-primary', facilitatorProfile.primary_color);
      }
      if (facilitatorProfile.secondary_color) {
        root.style.setProperty('--brand-secondary', facilitatorProfile.secondary_color);
      }
    }

    // Cleanup on unmount
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--brand-secondary');
    };
  }, [facilitatorProfile]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando diagnóstico...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Link Inválido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Se você recebeu este link por email, verifique se copiou corretamente 
              ou entre em contato com seu facilitador.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine test type label for welcome screen
  const getTestType = () => {
    if (isDiscTest) return "disc";
    if (isSoulPlanTest) return "mapa_da_alma";
    return "iq_is";
  };

  // Render based on current step
  switch (step) {
    case "welcome":
      return (
        <DiagnosticWelcome
          participantName={participant?.name || "Participante"}
          facilitatorProfile={facilitatorProfile}
          onStart={startDiagnostic}
          testType={getTestType()}
        />
      );

    case "name_input":
      return (
        <SoulPlanNameInput
          participantName={participant?.name || "Participante"}
          onCalculate={submitSoulPlanName}
        />
      );

    case "questions":
      if (!currentQuestion) return null;
      return (
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          currentValue={responses.get(currentQuestion.id)}
          onAnswer={answerQuestion}
          onPrevious={previousQuestion}
          canGoPrevious={currentQuestionIndex > 0}
        />
      );

    case "breathing":
      return (
        <ExerciseBreathing
          onComplete={completeBreathingExercise}
          onSkip={skipExercise}
        />
      );

    case "bodymap":
      return (
        <ExerciseBodyMapV2
          onComplete={completeBodyMapExercise}
          onSkip={skipExercise}
        />
      );

    case "reflection":
      return (
        <ExerciseReflection
          onComplete={completeReflectionExercise}
        />
      );

    case "processing":
      return <ProcessingScreen />;

    case "results":
      if (isSoulPlanTest) {
        return (
          <SoulPlanResults
            participantName={participant?.name || "Participante"}
            soulPlanResult={soulPlanResult || undefined}
            existingResult={existingResult}
            facilitatorProfile={facilitatorProfile}
          />
        );
      }
      if (isDiscTest) {
        return (
          <DiscResults
            participantName={participant?.name || "Participante"}
            participantEmail={participant?.email}
            accessToken={token}
            discScores={discScores || undefined}
            existingResult={existingResult}
            facilitatorProfile={facilitatorProfile}
          />
        );
      }
      return (
        <DiagnosticResults
          participantName={participant?.name || "Participante"}
          participantEmail={participant?.email}
          accessToken={token}
          scores={scores || { dimensionScores: [], totalScore: 0, totalPercentage: 0 }}
          existingResult={existingResult}
          facilitatorProfile={facilitatorProfile}
        />
      );

    default:
      return null;
  }
}
