-- Create table to store feedback session bookings
CREATE TABLE public.feedback_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  facilitator_id uuid NOT NULL,
  scheduled_at timestamptz,
  calendly_event_uri text,
  calendly_invitee_uri text,
  event_name text,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show'))
);

-- Add index for faster lookups
CREATE INDEX idx_feedback_sessions_participant ON public.feedback_sessions(participant_id);
CREATE INDEX idx_feedback_sessions_facilitator ON public.feedback_sessions(facilitator_id);
CREATE INDEX idx_feedback_sessions_status ON public.feedback_sessions(status);

-- Enable RLS
ALTER TABLE public.feedback_sessions ENABLE ROW LEVEL SECURITY;

-- Facilitators can view sessions for their participants
CREATE POLICY "Facilitators can view their participants sessions"
ON public.feedback_sessions
FOR SELECT
USING (public.is_facilitator_of_participant(participant_id));

-- Facilitators can insert sessions for their participants
CREATE POLICY "Facilitators can create sessions for their participants"
ON public.feedback_sessions
FOR INSERT
WITH CHECK (public.is_facilitator_of_participant(participant_id) AND facilitator_id = auth.uid());

-- Facilitators can update their own sessions
CREATE POLICY "Facilitators can update their sessions"
ON public.feedback_sessions
FOR UPDATE
USING (facilitator_id = auth.uid());

-- Facilitators can delete their own sessions
CREATE POLICY "Facilitators can delete their sessions"
ON public.feedback_sessions
FOR DELETE
USING (facilitator_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_feedback_sessions_updated_at
BEFORE UPDATE ON public.feedback_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.feedback_sessions IS 'Registra sessões de feedback agendadas entre participantes e facilitadores';
COMMENT ON COLUMN public.feedback_sessions.calendly_event_uri IS 'URI do evento no Calendly (para integração futura)';
COMMENT ON COLUMN public.feedback_sessions.calendly_invitee_uri IS 'URI do convidado no Calendly';
COMMENT ON COLUMN public.feedback_sessions.status IS 'Status: scheduled, completed, cancelled, no_show';