-- Etapa 2: Atualizar políticas RLS e funções para usar 'admin'

-- 1. Atualizar políticas RLS para audit_logs
DROP POLICY IF EXISTS "Facilitators can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Atualizar políticas RLS para system_settings
DROP POLICY IF EXISTS "Facilitators can view settings" ON public.system_settings;
DROP POLICY IF EXISTS "Facilitators can update settings" ON public.system_settings;
DROP POLICY IF EXISTS "Facilitators can insert settings" ON public.system_settings;

CREATE POLICY "Admins can view settings"
ON public.system_settings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
ON public.system_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert settings"
ON public.system_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Atualizar função get_platform_stats para verificar admin
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT json_build_object(
    'total_companies', (SELECT COUNT(*) FROM companies),
    'total_participants', (SELECT COUNT(*) FROM participants),
    'total_completed', (SELECT COUNT(*) FROM participants WHERE status = 'completed'),
    'total_in_progress', (SELECT COUNT(*) FROM participants WHERE status = 'in_progress'),
    'total_pending', (SELECT COUNT(*) FROM participants WHERE status IN ('pending', 'invited')),
    'total_diagnostics', (SELECT COUNT(*) FROM diagnostic_results),
    'total_admins', (SELECT COUNT(*) FROM user_roles WHERE role = 'admin'),
    'total_facilitators', (SELECT COUNT(*) FROM user_roles WHERE role = 'facilitator'),
    'total_managers', (SELECT COUNT(*) FROM user_roles WHERE role = 'company_manager'),
    'avg_score', (SELECT ROUND(AVG(total_score)::numeric, 2) FROM diagnostic_results),
    'completion_rate', (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE status = 'completed')::numeric / 
         NULLIF(COUNT(*), 0)) * 100, 1
      )
      FROM participants
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- 4. Atualizar função get_all_users para verificar admin e retornar múltiplas roles
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT json_agg(
    json_build_object(
      'user_id', au.id,
      'email', au.email,
      'full_name', p.full_name,
      'roles', (
        SELECT COALESCE(json_agg(ur.role), '[]'::json)
        FROM user_roles ur
        WHERE ur.user_id = au.id
      ),
      'created_at', au.created_at,
      'last_sign_in', au.last_sign_in_at
    )
    ORDER BY au.created_at DESC
  ) INTO result
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 5. Atualizar função admin_set_user_role para verificar admin
CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id uuid, p_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se chamador é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
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

-- 6. Atualizar função admin_remove_user_role para verificar admin + proteção
CREATE OR REPLACE FUNCTION public.admin_remove_user_role(p_user_id uuid, p_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se chamador é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Proteção contra auto-lockout: não pode remover própria role de admin
  IF p_user_id = auth.uid() AND p_role = 'admin' THEN
    RAISE EXCEPTION 'Não é possível remover sua própria role de administrador';
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