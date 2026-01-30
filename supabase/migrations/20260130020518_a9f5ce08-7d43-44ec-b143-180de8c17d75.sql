-- Remover policies muito permissivas
DROP POLICY IF EXISTS "Participantes podem inserir suas respostas" ON public.diagnostic_responses;
DROP POLICY IF EXISTS "Participantes podem atualizar suas respostas" ON public.diagnostic_responses;
DROP POLICY IF EXISTS "Sistema pode inserir resultados" ON public.diagnostic_results;

-- Criar policy mais restritiva para INSERT de respostas (via service role na edge function)
-- As inserções serão feitas via edge function com service role

-- Adicionar coluna para rastrear inserções autorizadas
ALTER TABLE public.diagnostic_responses 
ADD COLUMN IF NOT EXISTS inserted_by text DEFAULT 'system';

ALTER TABLE public.diagnostic_results 
ADD COLUMN IF NOT EXISTS inserted_by text DEFAULT 'system';