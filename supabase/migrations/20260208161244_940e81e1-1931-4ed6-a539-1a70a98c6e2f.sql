-- Atualizar funcao get_all_users para incluir dados de participantes
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
      'company_id', COALESCE(cm.company_id, part.company_id),
      'company_name', COALESCE(c_manager.name, c_participant.name),
      'participant_id', part.id
    )
    ORDER BY au.created_at DESC
  ) INTO result
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN company_managers cm ON cm.user_id = au.id AND cm.status = 'active'
  LEFT JOIN companies c_manager ON c_manager.id = cm.company_id
  LEFT JOIN participants part ON part.user_id = au.id
  LEFT JOIN companies c_participant ON c_participant.id = part.company_id;

  RETURN COALESCE(result, '[]'::json);
END;
$function$;

-- Criar funcao para admin vincular participante a empresa
CREATE OR REPLACE FUNCTION public.admin_link_participant_to_company(
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
DECLARE
  v_facilitator_id uuid;
BEGIN
  -- Verificar se chamador é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Buscar facilitador da empresa
  SELECT facilitator_id INTO v_facilitator_id
  FROM companies
  WHERE id = p_company_id;

  IF v_facilitator_id IS NULL THEN
    RAISE EXCEPTION 'Empresa não encontrada';
  END IF;

  -- Remover vínculo existente (se houver)
  DELETE FROM participants
  WHERE user_id = p_user_id;

  -- Criar registro de participante
  INSERT INTO participants (
    user_id,
    company_id,
    facilitator_id,
    name,
    email,
    status
  ) VALUES (
    p_user_id,
    p_company_id,
    v_facilitator_id,
    p_name,
    p_email,
    'pending'
  );

  -- Registrar no audit log
  PERFORM log_audit_event(
    'participant_linked_to_company',
    'user',
    p_user_id,
    jsonb_build_object('company_id', p_company_id)
  );

  RETURN true;
END;
$function$;

-- Criar funcao para admin desvincular participante de empresa
CREATE OR REPLACE FUNCTION public.admin_unlink_participant_from_company(p_user_id uuid)
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
  FROM participants
  WHERE user_id = p_user_id;

  -- Remover vínculo
  DELETE FROM participants
  WHERE user_id = p_user_id;

  -- Registrar no audit log
  IF v_company_id IS NOT NULL THEN
    PERFORM log_audit_event(
      'participant_unlinked_from_company',
      'user',
      p_user_id,
      jsonb_build_object('company_id', v_company_id)
    );
  END IF;

  RETURN true;
END;
$function$;