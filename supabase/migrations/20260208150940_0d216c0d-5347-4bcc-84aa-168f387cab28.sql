-- Função para atribuir role a um usuário (admin only)
CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  p_user_id uuid,
  p_role app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se chamador é facilitador
  IF NOT has_role(auth.uid(), 'facilitator') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Inserir role (ignora se já existe)
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Registrar no audit log
  PERFORM log_audit_event(
    'role_assigned',
    'user',
    p_user_id,
    jsonb_build_object('role', p_role::text)
  );

  RETURN true;
END;
$$;

-- Função para remover role de um usuário (admin only)
CREATE OR REPLACE FUNCTION public.admin_remove_user_role(
  p_user_id uuid,
  p_role app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se chamador é facilitador
  IF NOT has_role(auth.uid(), 'facilitator') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Proteção contra auto-lockout: não pode remover própria role de facilitador
  IF p_user_id = auth.uid() AND p_role = 'facilitator' THEN
    RAISE EXCEPTION 'Não é possível remover sua própria role de facilitador';
  END IF;

  -- Remover role
  DELETE FROM user_roles
  WHERE user_id = p_user_id AND role = p_role;

  -- Registrar no audit log
  PERFORM log_audit_event(
    'role_removed',
    'user',
    p_user_id,
    jsonb_build_object('role', p_role::text)
  );

  RETURN true;
END;
$$;