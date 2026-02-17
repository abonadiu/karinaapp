import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/backend/client";
import { Question } from "@/lib/diagnostic-questions";
import { calculateScores, DiagnosticScores } from "@/lib/diagnostic-scoring";
import { calculateDiscScores, DiscScores } from "@/lib/disc-scoring";
import { calculateSoulPlan, SoulPlanResult } from "@/lib/soul-plan-calculator";
import { calculateAstralChart, AstralChartResult, BirthData } from "@/lib/astral-chart-calculator";
import { useToast } from "@/hooks/use-toast";

export type DiagnosticStep =
  | "welcome"
  | "questions"
  | "name_input"
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

export interface BodySelection {
  areaId: string;
  type: "tension" | "comfort";
  intensity: 1 | 2 | 3;
}

export interface ExercisesData {
  breathing?: {
    completed: boolean;
    duration: number;
  };
  bodyMap?: {
    selections: BodySelection[];
  };
  reflection?: {
    insights: string;
  };
}

interface ParticipantTest {
  id: string;
  participant_id: string;
  test_type_id: string;
  access_token: string;
  status: string;
  test_types?: {
    slug: string;
    name: string;
  };
}

// Helper: sync participants.status based on all participant_tests statuses
async function updateParticipantStatusFromTests(participantId: string) {
  const { data: allTests } = await supabase
    .from("participant_tests")
    .select("status")
    .eq("participant_id", participantId);

  if (!allTests || allTests.length === 0) return;

  const allCompleted = allTests.every(t => t.status === "completed");
  const newStatus = allCompleted ? "completed" : "in_progress";

  await supabase
    .from("participants")
    .update({
      status: newStatus,
      ...(allCompleted ? { completed_at: new Date().toISOString() } : {})
    })
    .eq("id", participantId);
}

export function useDiagnostic(token: string) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [participantTest, setParticipantTest] = useState<ParticipantTest | null>(null);
  const [facilitatorProfile, setFacilitatorProfile] = useState<FacilitatorProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Map<string, number>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [step, setStep] = useState<DiagnosticStep>("welcome");
  const [exercisesData, setExercisesData] = useState<ExercisesData>({});
  const [scores, setScores] = useState<DiagnosticScores | null>(null);
  const [discScores, setDiscScores] = useState<DiscScores | null>(null);
  const [soulPlanResult, setSoulPlanResult] = useState<SoulPlanResult | null>(null);
  const [astralChartResult, setAstralChartResult] = useState<AstralChartResult | null>(null);
  const [existingResult, setExistingResult] = useState<any>(null);
  const [testTypeSlug, setTestTypeSlug] = useState<string | null>(null);

  // Helper to determine test type
  const isDiscTest = testTypeSlug === "disc";
  const isSoulPlanTest = testTypeSlug === "mapa_da_alma";
  const isAstralChartTest = testTypeSlug === "mapa_astral";

  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);
        setError(null);

        // Try new participant_tests table first
        const { data: ptData, error: ptError } = await supabase
          .from("participant_tests")
          .select("*, test_types(slug, name)")
          .eq("access_token", token)
          .single();

        let participantData: any = null;

        if (ptData && !ptError) {
          // New flow: found in participant_tests
          setParticipantTest(ptData as any);
          setTestTypeSlug(ptData.test_types?.slug || null);

          // Fetch participant
          const { data: pData, error: pError } = await supabase
            .from("participants")
            .select("*")
            .eq("id", ptData.participant_id)
            .single();

          if (pError || !pData) {
            setError("Link inválido ou expirado. Verifique o link recebido por email.");
            return;
          }
          participantData = pData;

          // Check if already completed
          if (ptData.status === "completed") {
            const { data: resultData } = await supabase
              .from("test_results")
              .select("*")
              .eq("participant_test_id", ptData.id)
              .single();

            if (resultData) {
              setExistingResult(resultData);
              setStep("results");
            }
          }

          // Load questions from test_questions
          const { data: questionsData, error: questionsError } = await supabase
            .from("test_questions")
            .select("*")
            .eq("test_type_id", ptData.test_type_id)
            .order("dimension_order", { ascending: true })
            .order("question_order", { ascending: true });

          if (questionsError) throw new Error("Erro ao carregar perguntas");
          setQuestions(questionsData || []);

          // Load existing responses
          const { data: responsesData } = await supabase
            .from("test_responses")
            .select("*")
            .eq("participant_test_id", ptData.id);

          if (responsesData && responsesData.length > 0) {
            const responsesMap = new Map<string, number>();
            responsesData.forEach(r => {
              responsesMap.set(r.question_id, r.score);
            });
            setResponses(responsesMap);

            const answeredIds = new Set(responsesData.map(r => r.question_id));
            const nextUnansweredIndex = questionsData?.findIndex(q => !answeredIds.has(q.id)) ?? 0;

            if (nextUnansweredIndex === -1 || nextUnansweredIndex >= (questionsData?.length || 0)) {
              // All questions answered
              if (ptData.test_types?.slug === "disc") {
                // DISC: skip exercises, go directly to processing/results
                if (ptData.status !== "completed") {
                  setStep("processing");
                }
              } else {
                setStep("breathing");
              }
            } else {
              setCurrentQuestionIndex(nextUnansweredIndex);
              if (ptData.status === "in_progress") {
                setStep("questions");
              }
            }
          }
        } else {
          // Fallback: try old participants table
          const { data: oldData, error: oldError } = await supabase
            .from("participants")
            .select("*")
            .eq("access_token", token)
            .single();

          if (oldError || !oldData) {
            setError("Link inválido ou expirado. Verifique o link recebido por email.");
            return;
          }

          participantData = oldData;
          setTestTypeSlug("iq_is"); // Old flow is always IQ+IS

          if (oldData.status === "completed") {
            const { data: resultData } = await supabase
              .from("diagnostic_results")
              .select("*")
              .eq("participant_id", oldData.id)
              .single();

            if (resultData) {
              setExistingResult(resultData);
              setStep("results");
            }
          }

          // Load questions from old table
          const { data: questionsData, error: questionsError } = await supabase
            .from("diagnostic_questions")
            .select("*")
            .order("dimension_order", { ascending: true })
            .order("question_order", { ascending: true });

          if (questionsError) throw new Error("Erro ao carregar perguntas");
          setQuestions(questionsData || []);

          // Load existing responses (old table)
          const { data: responsesData } = await supabase
            .from("diagnostic_responses")
            .select("*")
            .eq("participant_id", oldData.id);

          if (responsesData && responsesData.length > 0) {
            const responsesMap = new Map<string, number>();
            responsesData.forEach(r => {
              responsesMap.set(r.question_id, r.score);
            });
            setResponses(responsesMap);

            const answeredIds = new Set(responsesData.map(r => r.question_id));
            const nextUnansweredIndex = questionsData?.findIndex(q => !answeredIds.has(q.id)) ?? 0;

            if (nextUnansweredIndex === -1 || nextUnansweredIndex >= (questionsData?.length || 0)) {
              setStep("breathing");
            } else {
              setCurrentQuestionIndex(nextUnansweredIndex);
              if (oldData.status === "in_progress") {
                setStep("questions");
              }
            }
          }
        }

        setParticipant(participantData);

        // Fetch facilitator profile
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

  const startDiagnostic = useCallback(async () => {
    if (!participant) return;

    try {
      if (participantTest) {
        // New flow
        await supabase
          .from("participant_tests")
          .update({ status: "in_progress", started_at: new Date().toISOString() })
          .eq("id", participantTest.id);

        // Also sync participants.status
        await supabase
          .from("participants")
          .update({ status: "in_progress", started_at: new Date().toISOString() })
          .eq("id", participant.id)
          .in("status", ["pending", "invited"]);
      } else {
        // Old flow
        await supabase
          .from("participants")
          .update({ status: "in_progress", started_at: new Date().toISOString() })
          .eq("id", participant.id);
      }

      setParticipant({ ...participant, status: "in_progress" });
      if (isSoulPlanTest) {
        setStep("name_input");
      } else if (isAstralChartTest) {
        setStep("name_input"); // Reuse name_input step for birth data input
      } else {
        setStep("questions");
      }
    } catch (err: any) {
      toast({ title: "Erro", description: "Não foi possível iniciar o diagnóstico", variant: "destructive" });
    }
  }, [participant, participantTest, toast]);

  const answerQuestion = useCallback(async (questionId: string, score: number) => {
    if (!participant) return;

    try {
      if (participantTest) {
        // New flow: save to test_responses
        await supabase
          .from("test_responses")
          .upsert({
            participant_test_id: participantTest.id,
            question_id: questionId,
            score,
            answered_at: new Date().toISOString()
          }, { onConflict: "participant_test_id,question_id" });
      } else {
        // Old flow
        await supabase
          .from("diagnostic_responses")
          .upsert({
            participant_id: participant.id,
            question_id: questionId,
            score,
            answered_at: new Date().toISOString()
          }, { onConflict: "participant_id,question_id" });
      }

      setResponses(prev => new Map(prev).set(questionId, score));

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // All questions answered
        if (isDiscTest) {
          // DISC: skip exercises, finalize directly
          finalizeTest({});
        } else {
          setStep("breathing");
        }
      }
    } catch (err: any) {
      toast({ title: "Erro ao salvar resposta", description: "Tente novamente", variant: "destructive" });
    }
  }, [participant, participantTest, currentQuestionIndex, questions.length, toast, isDiscTest]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const completeBreathingExercise = useCallback((duration: number) => {
    setExercisesData(prev => ({ ...prev, breathing: { completed: true, duration } }));
    setStep("bodymap");
  }, []);

  const completeBodyMapExercise = useCallback((selections: BodySelection[]) => {
    setExercisesData(prev => ({ ...prev, bodyMap: { selections } }));
    setStep("reflection");
  }, []);

  const completeReflectionExercise = useCallback((insights: string) => {
    setExercisesData(prev => ({ ...prev, reflection: { insights } }));
    finalizeDiagnostic({ ...exercisesData, reflection: { insights } });
  }, [exercisesData]);

  // Shared finalization logic for both IQ+IS and DISC
  const finalizeTest = useCallback(async (finalExercisesData: ExercisesData) => {
    if (!participant) return;

    setStep("processing");

    try {
      let dimensionScoresObj: Record<string, number> = {};
      let totalScoreValue: number;

      if (isDiscTest) {
        // DISC scoring
        const calculatedDiscScores = calculateDiscScores(questions, responses);
        setDiscScores(calculatedDiscScores);

        calculatedDiscScores.dimensionScores.forEach(d => {
          dimensionScoresObj[d.dimension] = d.score;
        });
        totalScoreValue = calculatedDiscScores.totalScore;
      } else {
        // IQ+IS scoring
        const calculatedScores = calculateScores(questions, responses);
        setScores(calculatedScores);

        calculatedScores.dimensionScores.forEach(d => {
          dimensionScoresObj[d.dimension] = d.score;
        });
        totalScoreValue = calculatedScores.totalScore;
      }

      if (participantTest) {
        // New flow
        await supabase
          .from("test_results")
          .insert([{
            participant_test_id: participantTest.id,
            dimension_scores: dimensionScoresObj as any,
            total_score: totalScoreValue,
            exercises_data: finalExercisesData as any,
            completed_at: new Date().toISOString()
          }]);

        await supabase
          .from("participant_tests")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", participantTest.id);

        // Sync participants.status based on all tests
        await updateParticipantStatusFromTests(participant.id);
      } else {
        // Old flow (always IQ+IS)
        await supabase
          .from("diagnostic_results")
          .insert([{
            participant_id: participant.id,
            dimension_scores: dimensionScoresObj as any,
            total_score: totalScoreValue,
            exercises_data: finalExercisesData as any,
            completed_at: new Date().toISOString()
          }]);

        await supabase
          .from("participants")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", participant.id);
      }

      setStep("results");
    } catch (err: any) {
      toast({ title: "Erro ao finalizar", description: "Tente novamente", variant: "destructive" });
      if (isDiscTest) {
        setStep("questions");
      } else {
        setStep("reflection");
      }
    }
  }, [participant, participantTest, questions, responses, toast, isDiscTest]);

  // Legacy finalizeDiagnostic for IQ+IS (called from completeReflectionExercise)
  const finalizeDiagnostic = useCallback(async (finalExercisesData: ExercisesData) => {
    await finalizeTest(finalExercisesData);
  }, [finalizeTest]);

  // Soul Plan: submit birth name and calculate
  const submitSoulPlanName = useCallback(async (birthName: string) => {
    if (!participant || !participantTest) return;

    setStep("processing");

    try {
      const result = calculateSoulPlan(birthName);
      setSoulPlanResult(result);

      // Build dimension_scores object with position energies
      const dimensionScoresObj: Record<string, any> = {
        birthName,
        normalizedName: result.normalizedName,
        isShortName: result.isShortName,
        worldlyChallenge: { pair: result.positions.worldlyChallenge.pair, energyNumber: result.positions.worldlyChallenge.energyNumber },
        spiritualChallenge: { pair: result.positions.spiritualChallenge.pair, energyNumber: result.positions.spiritualChallenge.energyNumber },
        worldlyTalent: { pair: result.positions.worldlyTalent.pair, energyNumber: result.positions.worldlyTalent.energyNumber },
        spiritualTalent: { pair: result.positions.spiritualTalent.pair, energyNumber: result.positions.spiritualTalent.energyNumber },
        worldlyGoal: { pair: result.positions.worldlyGoal.pair, energyNumber: result.positions.worldlyGoal.energyNumber },
        spiritualGoal: { pair: result.positions.spiritualGoal.pair, energyNumber: result.positions.spiritualGoal.energyNumber },
        soulDestiny: { pair: result.positions.soulDestiny.pair, energyNumber: result.positions.soulDestiny.energyNumber },
        dominantEnergies: result.dominantEnergies,
      };

      await supabase
        .from("test_results")
        .insert([{
          participant_test_id: participantTest.id,
          dimension_scores: dimensionScoresObj as any,
          total_score: result.positions.soulDestiny.energyNumber,
          exercises_data: { birthName, letterValues: result.letterValues } as any,
          completed_at: new Date().toISOString()
        }]);

      await supabase
        .from("participant_tests")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", participantTest.id);

      // Sync participants.status based on all tests
      await updateParticipantStatusFromTests(participant.id);

      setStep("results");
    } catch (err: any) {
      toast({ title: "Erro ao calcular Mapa da Alma", description: "Tente novamente", variant: "destructive" });
      setStep("name_input");
    }
  }, [participant, participantTest, toast]);

  // Astral Chart: submit birth data and calculate
  const submitAstralChartData = useCallback(async (birthData: BirthData) => {
    if (!participant || !participantTest) return;

    setStep("processing");

    try {
      const result = calculateAstralChart(birthData);
      setAstralChartResult(result);

      // Build dimension_scores object with chart data
      const dimensionScoresObj: Record<string, any> = {
        birthData,
        sunSign: result.sunSign,
        moonSign: result.moonSign,
        ascendantSign: result.ascendantSign,
        midheavenSign: result.midheavenSign,
        planets: result.planets.map(p => ({
          key: p.key,
          sign: p.sign,
          house: p.house,
          degree: p.eclipticDegree,
          isRetrograde: p.isRetrograde,
        })),
        houses: result.houses.map(h => ({
          id: h.id,
          sign: h.sign,
          degreeStart: h.eclipticDegreeStart,
        })),
        aspectsCount: result.aspects.length,
      };

      await supabase
        .from("test_results")
        .insert([{
          participant_test_id: participantTest.id,
          dimension_scores: dimensionScoresObj as any,
          total_score: 0,
          exercises_data: { birthData, fullResult: result } as any,
          completed_at: new Date().toISOString()
        }]);

      await supabase
        .from("participant_tests")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", participantTest.id);

      // Sync participants.status based on all tests
      await updateParticipantStatusFromTests(participant.id);

      setStep("results");
    } catch (err: any) {
      toast({ title: "Erro ao calcular Mapa Astral", description: "Tente novamente", variant: "destructive" });
      setStep("name_input");
    }
  }, [participant, participantTest, toast]);

  const skipExercise = useCallback(() => {
    if (step === "breathing") setStep("bodymap");
    else if (step === "bodymap") setStep("reflection");
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
    discScores,
    soulPlanResult,
    astralChartResult,
    existingResult,
    testTypeSlug,
    isDiscTest,
    isSoulPlanTest,
    isAstralChartTest,
    progress: questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0,
    startDiagnostic,
    answerQuestion,
    previousQuestion,
    completeBreathingExercise,
    completeBodyMapExercise,
    completeReflectionExercise,
    submitSoulPlanName,
    submitAstralChartData,
    skipExercise,
    setStep
  };
}
