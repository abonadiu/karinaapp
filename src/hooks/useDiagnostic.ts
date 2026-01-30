import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/lib/diagnostic-questions";
import { calculateScores, DiagnosticScores } from "@/lib/diagnostic-scoring";
import { useToast } from "@/hooks/use-toast";

export type DiagnosticStep = 
  | "welcome"
  | "questions"
  | "breathing"
  | "bodymap"
  | "reflection"
  | "processing"
  | "results";

export interface Participant {
  id: string;
  name: string;
  email: string;
  status: string;
  company_id: string;
  facilitator_id: string;
}

export interface FacilitatorProfile {
  full_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  calendly_url: string | null;
}

export interface ExercisesData {
  breathing?: {
    completed: boolean;
    duration: number;
  };
  bodyMap?: {
    tensionAreas: string[];
    comfortAreas: string[];
  };
  reflection?: {
    insights: string;
  };
}

export function useDiagnostic(token: string) {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [facilitatorProfile, setFacilitatorProfile] = useState<FacilitatorProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Map<string, number>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [step, setStep] = useState<DiagnosticStep>("welcome");
  const [exercisesData, setExercisesData] = useState<ExercisesData>({});
  const [scores, setScores] = useState<DiagnosticScores | null>(null);
  const [existingResult, setExistingResult] = useState<any>(null);

  // Validar token e carregar dados iniciais
  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);
        setError(null);

        // Buscar participante pelo token
        const { data: participantData, error: participantError } = await supabase
          .from("participants")
          .select("*")
          .eq("access_token", token)
          .single();

        if (participantError || !participantData) {
          setError("Link inválido ou expirado. Verifique o link recebido por email.");
          return;
        }

        // Verificar se já completou
        if (participantData.status === "completed") {
          // Buscar resultado existente
          const { data: resultData } = await supabase
            .from("diagnostic_results")
            .select("*")
            .eq("participant_id", participantData.id)
            .single();

          if (resultData) {
            setExistingResult(resultData);
            setStep("results");
          }
        }

        setParticipant(participantData);

        // Buscar perfil do facilitador para white-label
        if (participantData.facilitator_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, logo_url, primary_color, secondary_color, calendly_url")
            .eq("user_id", participantData.facilitator_id)
            .single();

          if (profileData) {
            setFacilitatorProfile(profileData);
          }
        }

        // Carregar perguntas
        const { data: questionsData, error: questionsError } = await supabase
          .from("diagnostic_questions")
          .select("*")
          .order("dimension_order", { ascending: true })
          .order("question_order", { ascending: true });

        if (questionsError) {
          throw new Error("Erro ao carregar perguntas");
        }

        setQuestions(questionsData || []);

        // Carregar respostas existentes (para continuar de onde parou)
        const { data: responsesData } = await supabase
          .from("diagnostic_responses")
          .select("*")
          .eq("participant_id", participantData.id);

        if (responsesData && responsesData.length > 0) {
          const responsesMap = new Map<string, number>();
          responsesData.forEach(r => {
            responsesMap.set(r.question_id, r.score);
          });
          setResponses(responsesMap);
          
          // Encontrar próxima pergunta não respondida
          const answeredIds = new Set(responsesData.map(r => r.question_id));
          const nextUnansweredIndex = questionsData?.findIndex(q => !answeredIds.has(q.id)) ?? 0;
          
          if (nextUnansweredIndex === -1 || nextUnansweredIndex >= (questionsData?.length || 0)) {
            // Todas respondidas, ir para exercícios
            setStep("breathing");
          } else {
            setCurrentQuestionIndex(nextUnansweredIndex);
            if (participantData.status === "in_progress") {
              setStep("questions");
            }
          }
        }

      } catch (err: any) {
        setError(err.message || "Erro ao carregar diagnóstico");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      initialize();
    }
  }, [token]);

  // Iniciar diagnóstico
  const startDiagnostic = useCallback(async () => {
    if (!participant) return;

    try {
      // Atualizar status e started_at
      const { error: updateError } = await supabase
        .from("participants")
        .update({ 
          status: "in_progress",
          started_at: new Date().toISOString()
        })
        .eq("id", participant.id);

      if (updateError) throw updateError;

      setParticipant({ ...participant, status: "in_progress" });
      setStep("questions");
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o diagnóstico",
        variant: "destructive"
      });
    }
  }, [participant, toast]);

  // Responder pergunta
  const answerQuestion = useCallback(async (questionId: string, score: number) => {
    if (!participant) return;

    try {
      // Salvar/atualizar resposta no banco
      const { error: upsertError } = await supabase
        .from("diagnostic_responses")
        .upsert({
          participant_id: participant.id,
          question_id: questionId,
          score,
          answered_at: new Date().toISOString()
        }, {
          onConflict: "participant_id,question_id"
        });

      if (upsertError) throw upsertError;

      // Atualizar estado local
      setResponses(prev => new Map(prev).set(questionId, score));

      // Avançar para próxima pergunta ou exercícios
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setStep("breathing");
      }
    } catch (err: any) {
      toast({
        title: "Erro ao salvar resposta",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  }, [participant, currentQuestionIndex, questions.length, toast]);

  // Ir para pergunta anterior
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Completar exercício de respiração
  const completeBreathingExercise = useCallback((duration: number) => {
    setExercisesData(prev => ({
      ...prev,
      breathing: { completed: true, duration }
    }));
    setStep("bodymap");
  }, []);

  // Completar mapeamento corporal
  const completeBodyMapExercise = useCallback((tensionAreas: string[], comfortAreas: string[]) => {
    setExercisesData(prev => ({
      ...prev,
      bodyMap: { tensionAreas, comfortAreas }
    }));
    setStep("reflection");
  }, []);

  // Completar reflexão
  const completeReflectionExercise = useCallback((insights: string) => {
    setExercisesData(prev => ({
      ...prev,
      reflection: { insights }
    }));
    finalizeDiagnostic({ ...exercisesData, reflection: { insights } });
  }, [exercisesData]);

  // Finalizar diagnóstico
  const finalizeDiagnostic = useCallback(async (finalExercisesData: ExercisesData) => {
    if (!participant) return;

    setStep("processing");

    try {
      // Calcular scores
      const calculatedScores = calculateScores(questions, responses);
      setScores(calculatedScores);

      // Preparar dimension_scores para salvar
      const dimensionScoresObj: Record<string, number> = {};
      calculatedScores.dimensionScores.forEach(d => {
        dimensionScoresObj[d.dimension] = d.score;
      });

      // Salvar resultado
      const { error: resultError } = await supabase
        .from("diagnostic_results")
        .insert([{
          participant_id: participant.id,
          dimension_scores: dimensionScoresObj as any,
          total_score: calculatedScores.totalScore,
          exercises_data: finalExercisesData as any,
          completed_at: new Date().toISOString()
        }]);

      if (resultError) throw resultError;

      // Atualizar status do participante
      const { error: updateError } = await supabase
        .from("participants")
        .update({
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", participant.id);

      if (updateError) throw updateError;

      setStep("results");
    } catch (err: any) {
      toast({
        title: "Erro ao finalizar",
        description: "Tente novamente",
        variant: "destructive"
      });
      setStep("reflection");
    }
  }, [participant, questions, responses, toast]);

  // Pular exercício
  const skipExercise = useCallback(() => {
    if (step === "breathing") {
      setStep("bodymap");
    } else if (step === "bodymap") {
      setStep("reflection");
    }
  }, [step]);

  return {
    loading,
    error,
    participant,
    facilitatorProfile,
    questions,
    responses,
    currentQuestionIndex,
    currentQuestion: questions[currentQuestionIndex],
    step,
    exercisesData,
    scores,
    existingResult,
    progress: questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0,
    startDiagnostic,
    answerQuestion,
    previousQuestion,
    completeBreathingExercise,
    completeBodyMapExercise,
    completeReflectionExercise,
    skipExercise,
    setStep
  };
}
