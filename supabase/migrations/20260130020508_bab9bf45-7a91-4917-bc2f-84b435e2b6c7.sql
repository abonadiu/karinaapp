-- Tabela de perguntas do diagnóstico
CREATE TABLE public.diagnostic_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dimension text NOT NULL,
  dimension_order integer NOT NULL,
  question_order integer NOT NULL,
  question_text text NOT NULL,
  reverse_scored boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de respostas do participante
CREATE TABLE public.diagnostic_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.diagnostic_questions(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  answered_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(participant_id, question_id)
);

-- Tabela de resultados finais
CREATE TABLE public.diagnostic_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id uuid NOT NULL UNIQUE REFERENCES public.participants(id) ON DELETE CASCADE,
  dimension_scores jsonb NOT NULL DEFAULT '{}',
  total_score decimal(3,2) NOT NULL DEFAULT 0,
  exercises_data jsonb NOT NULL DEFAULT '{}',
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;

-- RLS para diagnostic_questions (leitura pública)
CREATE POLICY "Perguntas são públicas para leitura"
ON public.diagnostic_questions
FOR SELECT
USING (true);

-- Função para verificar se o token pertence a um participante válido
CREATE OR REPLACE FUNCTION public.get_participant_by_token(p_token text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.participants
  WHERE access_token = p_token
  AND status IN ('pending', 'invited', 'in_progress')
  LIMIT 1
$$;

-- Função para verificar se o usuário é facilitador do participante
CREATE OR REPLACE FUNCTION public.is_facilitator_of_participant(p_participant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.participants
    WHERE id = p_participant_id
    AND facilitator_id = auth.uid()
  )
$$;

-- RLS para diagnostic_responses
CREATE POLICY "Facilitadores podem ver respostas de seus participantes"
ON public.diagnostic_responses
FOR SELECT
USING (public.is_facilitator_of_participant(participant_id));

CREATE POLICY "Participantes podem inserir suas respostas"
ON public.diagnostic_responses
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Participantes podem atualizar suas respostas"
ON public.diagnostic_responses
FOR UPDATE
USING (true);

-- RLS para diagnostic_results
CREATE POLICY "Facilitadores podem ver resultados de seus participantes"
ON public.diagnostic_results
FOR SELECT
USING (public.is_facilitator_of_participant(participant_id));

CREATE POLICY "Sistema pode inserir resultados"
ON public.diagnostic_results
FOR INSERT
WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_diagnostic_responses_participant ON public.diagnostic_responses(participant_id);
CREATE INDEX idx_diagnostic_responses_question ON public.diagnostic_responses(question_id);
CREATE INDEX idx_diagnostic_results_participant ON public.diagnostic_results(participant_id);
CREATE INDEX idx_diagnostic_questions_order ON public.diagnostic_questions(dimension_order, question_order);