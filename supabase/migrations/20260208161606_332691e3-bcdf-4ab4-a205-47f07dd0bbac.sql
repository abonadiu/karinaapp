-- Adicionar coluna user_id na tabela participants
ALTER TABLE participants ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);

-- Adicionar policy RLS para participantes verem seus próprios dados
CREATE POLICY "Participants can view their own data"
ON participants FOR SELECT
USING (user_id = auth.uid());