
-- 1. Tabela de tipos de teste
CREATE TABLE public.test_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'brain',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.test_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Test types are publicly readable"
  ON public.test_types FOR SELECT
  USING (true);

-- 2. Tabela de perguntas por tipo de teste
CREATE TABLE public.test_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_type_id uuid NOT NULL REFERENCES public.test_types(id) ON DELETE CASCADE,
  dimension text NOT NULL,
  dimension_order integer NOT NULL,
  question_order integer NOT NULL,
  question_text text NOT NULL,
  reverse_scored boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Test questions are publicly readable"
  ON public.test_questions FOR SELECT
  USING (true);

-- 3. Tabela de vínculo participante-teste
CREATE TABLE public.participant_tests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  test_type_id uuid NOT NULL REFERENCES public.test_types(id),
  access_token text NOT NULL DEFAULT (gen_random_uuid())::text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  invited_at timestamp with time zone,
  reminder_count integer NOT NULL DEFAULT 0,
  last_reminder_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(participant_id, test_type_id)
);

ALTER TABLE public.participant_tests ENABLE ROW LEVEL SECURITY;

-- Função helper para verificar facilitador do participant_test
CREATE OR REPLACE FUNCTION public.is_facilitator_of_participant_test(p_participant_test_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.participant_tests pt
    JOIN public.participants p ON p.id = pt.participant_id
    WHERE pt.id = p_participant_test_id
      AND p.facilitator_id = auth.uid()
  )
$$;

CREATE POLICY "Facilitators can view their participant tests"
  ON public.participant_tests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.participants p
    WHERE p.id = participant_id AND p.facilitator_id = auth.uid()
  ));

CREATE POLICY "Facilitators can create participant tests"
  ON public.participant_tests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.participants p
    WHERE p.id = participant_id AND p.facilitator_id = auth.uid()
  ));

CREATE POLICY "Facilitators can update their participant tests"
  ON public.participant_tests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.participants p
    WHERE p.id = participant_id AND p.facilitator_id = auth.uid()
  ));

CREATE POLICY "Facilitators can delete their participant tests"
  ON public.participant_tests FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.participants p
    WHERE p.id = participant_id AND p.facilitator_id = auth.uid()
  ));

-- Trigger para updated_at
CREATE TRIGGER update_participant_tests_updated_at
  BEFORE UPDATE ON public.participant_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Tabela de respostas por teste
CREATE TABLE public.test_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_test_id uuid NOT NULL REFERENCES public.participant_tests(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.test_questions(id),
  score integer NOT NULL,
  answered_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(participant_test_id, question_id)
);

ALTER TABLE public.test_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facilitators can view test responses"
  ON public.test_responses FOR SELECT
  USING (is_facilitator_of_participant_test(participant_test_id));

-- 5. Tabela de resultados por teste
CREATE TABLE public.test_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_test_id uuid NOT NULL REFERENCES public.participant_tests(id) ON DELETE CASCADE UNIQUE,
  dimension_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_score numeric NOT NULL DEFAULT 0,
  exercises_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facilitators can view test results"
  ON public.test_results FOR SELECT
  USING (is_facilitator_of_participant_test(participant_test_id));

-- 6. Seed: tipo IQ+IS
INSERT INTO public.test_types (slug, name, description, icon, is_active)
VALUES 
  ('iq-is', 'Diagnóstico IQ+IS', 'Diagnóstico de Inteligência Emocional e Inteligência Social', 'brain', true),
  ('disc', 'Perfil DISC', 'Análise de perfil comportamental DISC', 'target', false),
  ('mapa-alma', 'Mapa da Alma', 'Mapeamento profundo da essência interior', 'heart', false),
  ('numerologia', 'Numerologia', 'Análise numerológica personalizada', 'hash', false),
  ('mapa-astral', 'Mapa Astral', 'Mapa astral completo e interpretado', 'star', false);

-- 7. Migrar perguntas existentes para test_questions
INSERT INTO public.test_questions (test_type_id, dimension, dimension_order, question_order, question_text, reverse_scored, created_at)
SELECT 
  (SELECT id FROM public.test_types WHERE slug = 'iq-is'),
  dq.dimension,
  dq.dimension_order,
  dq.question_order,
  dq.question_text,
  dq.reverse_scored,
  dq.created_at
FROM public.diagnostic_questions dq;

-- 8. Migrar participant_tests existentes (criar registros para participantes que já têm access_token)
INSERT INTO public.participant_tests (participant_id, test_type_id, access_token, status, started_at, completed_at, invited_at, reminder_count, last_reminder_at, created_at)
SELECT 
  p.id,
  (SELECT id FROM public.test_types WHERE slug = 'iq-is'),
  p.access_token,
  p.status,
  p.started_at,
  p.completed_at,
  p.invited_at,
  p.reminder_count,
  p.last_reminder_at,
  p.created_at
FROM public.participants p;

-- 9. Migrar respostas existentes para test_responses
INSERT INTO public.test_responses (participant_test_id, question_id, score, answered_at, created_at)
SELECT 
  pt.id,
  tq.id,
  dr.score,
  dr.answered_at,
  dr.created_at
FROM public.diagnostic_responses dr
JOIN public.participant_tests pt ON pt.participant_id = dr.participant_id
JOIN public.diagnostic_questions dq ON dq.id = dr.question_id
JOIN public.test_questions tq ON tq.question_text = dq.question_text 
  AND tq.dimension = dq.dimension
  AND tq.test_type_id = (SELECT id FROM public.test_types WHERE slug = 'iq-is');

-- 10. Migrar resultados existentes para test_results
INSERT INTO public.test_results (participant_test_id, dimension_scores, total_score, exercises_data, completed_at, created_at)
SELECT 
  pt.id,
  dr.dimension_scores,
  dr.total_score,
  dr.exercises_data,
  dr.completed_at,
  dr.created_at
FROM public.diagnostic_results dr
JOIN public.participant_tests pt ON pt.participant_id = dr.participant_id;
