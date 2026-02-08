-- Atualizar função get_all_users para incluir empresa vinculada
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      'last_sign_in', au.last_sign_in_at,
      'company_id', cm.company_id,
      'company_name', c.name
    )
    ORDER BY au.created_at DESC
  ) INTO result
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN company_managers cm ON cm.user_id = au.id AND cm.status = 'active'
  LEFT JOIN companies c ON c.id = cm.company_id;

  RETURN COALESCE(result, '[]'::json);
END;
$function$;

-- Função para vincular usuário a empresa
CREATE OR REPLACE FUNCTION public.admin_link_user_to_company(
  p_user_id uuid,
  p_company_id uuid,
  p_name text,
  p_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se chamador é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Remover vínculo existente (se houver)
  DELETE FROM company_managers
  WHERE user_id = p_user_id;

  -- Criar novo vínculo
  INSERT INTO company_managers (
    user_id,
    company_id,
    name,
    email,
    status,
    activated_at,
    invited_by
  ) VALUES (
    p_user_id,
    p_company_id,
    p_name,
    p_email,
    'active',
    now(),
    auth.uid()
  );

  -- Registrar no audit log
  PERFORM log_audit_event(
    'user_linked_to_company',
    'user',
    p_user_id,
    jsonb_build_object('company_id', p_company_id)
  );

  RETURN true;
END;
$function$;

-- Função para desvincular usuário de empresa
CREATE OR REPLACE FUNCTION public.admin_unlink_user_from_company(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_company_id uuid;
BEGIN
  -- Verificar se chamador é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Buscar empresa antes de deletar
  SELECT company_id INTO v_company_id
  FROM company_managers
  WHERE user_id = p_user_id AND status = 'active';

  -- Remover vínculo
  DELETE FROM company_managers
  WHERE user_id = p_user_id;

  -- Registrar no audit log
  IF v_company_id IS NOT NULL THEN
    PERFORM log_audit_event(
      'user_unlinked_from_company',
      'user',
      p_user_id,
      jsonb_build_object('company_id', v_company_id)
    );
  END IF;

  RETURN true;
END;
$function$;