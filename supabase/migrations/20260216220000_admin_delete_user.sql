-- Função para excluir um usuário (admin/facilitator only)
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
BEGIN
  v_caller_id := auth.uid();

  -- 1. Verificar se o chamador tem permissão (facilitador ou admin)
  -- Nota: has_role é uma função auxiliar já existente no sistema
  IF NOT (has_role(v_caller_id, 'facilitator') OR has_role(v_caller_id, 'admin')) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores e facilitadores podem excluir usuários';
  END IF;

  -- 2. Impedir auto-exclusão
  IF v_caller_id = p_user_id THEN
    RAISE EXCEPTION 'Não é possível excluir seu próprio usuário';
  END IF;

  -- 3. Registrar no audit log antes da exclusão (para manter rastro)
  -- Nota: log_audit_event é uma função auxiliar já existente
  PERFORM log_audit_event(
    'user_deleted',
    'user',
    p_user_id,
    jsonb_build_object('deleted_by', v_caller_id)
  );

  -- 4. Excluir do auth.users
  -- Como profiles, user_roles, participants etc têm ON DELETE CASCADE vinculado ao user_id,
  -- a exclusão no auth.users irá limpar as tabelas públicas automaticamente.
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao excluir usuário: %', SQLERRM;
    RETURN false;
END;
$$;

-- Garantir que a função é acessível
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO service_role;
