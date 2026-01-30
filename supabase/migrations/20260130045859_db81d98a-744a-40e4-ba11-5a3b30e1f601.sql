-- Tabela de logs de auditoria
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas facilitadores podem ver logs
CREATE POLICY "Facilitators can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'facilitator'));

-- Tabela de configurações do sistema
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Facilitadores podem ver e editar configurações
CREATE POLICY "Facilitators can view settings"
  ON public.system_settings FOR SELECT
  USING (public.has_role(auth.uid(), 'facilitator'));

CREATE POLICY "Facilitators can update settings"
  ON public.system_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'facilitator'));

CREATE POLICY "Facilitators can insert settings"
  ON public.system_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'facilitator'));

-- Trigger para updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para registrar log de auditoria
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_email text;
  v_log_id uuid;
BEGIN
  -- Obter email do usuário atual
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    v_user_email,
    p_action,
    p_entity_type,
    p_entity_id,
    p_details
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Função para obter estatísticas globais da plataforma
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se é facilitador
  IF NOT public.has_role(auth.uid(), 'facilitator') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT json_build_object(
    'total_companies', (SELECT COUNT(*) FROM companies),
    'total_participants', (SELECT COUNT(*) FROM participants),
    'total_completed', (SELECT COUNT(*) FROM participants WHERE status = 'completed'),
    'total_in_progress', (SELECT COUNT(*) FROM participants WHERE status = 'in_progress'),
    'total_pending', (SELECT COUNT(*) FROM participants WHERE status IN ('pending', 'invited')),
    'total_diagnostics', (SELECT COUNT(*) FROM diagnostic_results),
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

-- Função para listar todos os usuários (facilitadores e gestores)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se é facilitador
  IF NOT public.has_role(auth.uid(), 'facilitator') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT json_agg(
    json_build_object(
      'user_id', au.id,
      'email', au.email,
      'full_name', p.full_name,
      'role', ur.role,
      'created_at', au.created_at,
      'last_sign_in', au.last_sign_in_at
    )
    ORDER BY au.created_at DESC
  ) INTO result
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN user_roles ur ON ur.user_id = au.id;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Inserir configurações padrão
INSERT INTO public.system_settings (key, value, description) VALUES
  ('email_templates', '{"invite_subject": "Convite para Diagnóstico IQ+IS", "reminder_subject": "Lembrete: Complete seu diagnóstico"}'::jsonb, 'Templates de email'),
  ('reminder_settings', '{"days_after_invite": 3, "days_between_reminders": 3, "max_reminders": 3}'::jsonb, 'Configurações de lembretes automáticos'),
  ('platform_name', '{"name": "Plataforma IQ+IS", "tagline": "Diagnóstico de Inteligência Emocional e Espiritual"}'::jsonb, 'Nome e tagline da plataforma')
ON CONFLICT (key) DO NOTHING;