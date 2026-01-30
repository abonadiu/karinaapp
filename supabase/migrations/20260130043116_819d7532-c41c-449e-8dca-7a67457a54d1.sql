-- ===========================================
-- Sistema de Lembretes Automáticos
-- ===========================================

-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ===========================================
-- Novas colunas na tabela participants
-- ===========================================
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS reminder_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ;

-- ===========================================
-- Tabela de auditoria de lembretes
-- ===========================================
CREATE TABLE public.participant_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reminder_number INTEGER NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_participant_reminders_participant_id 
ON public.participant_reminders(participant_id);

CREATE INDEX idx_participant_reminders_sent_at 
ON public.participant_reminders(sent_at DESC);

CREATE INDEX idx_participants_reminder_eligible 
ON public.participants(status, invited_at, reminder_count, last_reminder_at)
WHERE status IN ('invited', 'in_progress');

-- ===========================================
-- RLS para participant_reminders
-- ===========================================
ALTER TABLE public.participant_reminders ENABLE ROW LEVEL SECURITY;

-- Facilitadores podem ver lembretes de seus participantes
CREATE POLICY "Facilitators can view reminders of their participants"
ON public.participant_reminders FOR SELECT
USING (
  participant_id IN (
    SELECT id FROM public.participants
    WHERE facilitator_id = auth.uid()
  )
);

-- ===========================================
-- Função para buscar participantes elegíveis para lembrete
-- ===========================================
CREATE OR REPLACE FUNCTION public.get_pending_reminders(
  p_days_after_invite INTEGER DEFAULT 3,
  p_days_between_reminders INTEGER DEFAULT 3,
  p_max_reminders INTEGER DEFAULT 3,
  p_batch_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
  participant_id UUID,
  participant_name TEXT,
  participant_email TEXT,
  access_token TEXT,
  facilitator_id UUID,
  reminder_count INTEGER,
  invited_at TIMESTAMPTZ,
  days_since_invite INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as participant_id,
    p.name as participant_name,
    p.email as participant_email,
    p.access_token,
    p.facilitator_id,
    p.reminder_count,
    p.invited_at,
    EXTRACT(DAY FROM (now() - p.invited_at))::INTEGER as days_since_invite
  FROM public.participants p
  WHERE p.status IN ('invited', 'in_progress')
    AND p.invited_at IS NOT NULL
    AND p.invited_at < now() - (p_days_after_invite || ' days')::INTERVAL
    AND p.reminder_count < p_max_reminders
    AND (
      p.last_reminder_at IS NULL 
      OR p.last_reminder_at < now() - (p_days_between_reminders || ' days')::INTERVAL
    )
  ORDER BY p.invited_at ASC
  LIMIT p_batch_limit;
$$;

-- ===========================================
-- Função para registrar lembrete enviado
-- ===========================================
CREATE OR REPLACE FUNCTION public.record_reminder_sent(
  p_participant_id UUID,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INTEGER;
BEGIN
  -- Buscar contagem atual
  SELECT reminder_count INTO v_current_count
  FROM public.participants
  WHERE id = p_participant_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Atualizar participante
  UPDATE public.participants
  SET 
    reminder_count = reminder_count + 1,
    last_reminder_at = now(),
    updated_at = now()
  WHERE id = p_participant_id;

  -- Registrar na tabela de auditoria
  INSERT INTO public.participant_reminders (
    participant_id,
    reminder_number,
    success,
    error_message
  ) VALUES (
    p_participant_id,
    v_current_count + 1,
    p_success,
    p_error_message
  );

  RETURN true;
END;
$$;