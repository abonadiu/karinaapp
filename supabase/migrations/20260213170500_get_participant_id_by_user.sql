-- Função para buscar o ID do participante pelo user_id (análoga a get_manager_company_id)
CREATE OR REPLACE FUNCTION public.get_participant_id_by_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id 
  FROM public.participants
  WHERE user_id = _user_id
  LIMIT 1
$$;
