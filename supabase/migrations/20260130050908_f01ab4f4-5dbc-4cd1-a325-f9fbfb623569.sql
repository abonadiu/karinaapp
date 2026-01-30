-- Add calendly_url column to profiles table for facilitators
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS calendly_url text NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.calendly_url IS 'URL do Calendly ou serviço similar para agendamento de sessões de feedback';