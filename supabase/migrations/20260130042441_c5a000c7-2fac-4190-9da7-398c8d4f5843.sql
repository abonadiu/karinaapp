-- Etapa 1: Portal da Empresa - Estrutura de Roles e Gestores

-- 1. Criar enum para roles da aplicação
CREATE TYPE public.app_role AS ENUM ('facilitator', 'company_manager');

-- 2. Criar tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar tabela de gestores de empresa (convites pendentes e ativos)
CREATE TABLE public.company_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  invite_token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ,
  UNIQUE (email, company_id)
);

-- 5. Habilitar RLS na tabela company_managers
ALTER TABLE public.company_managers ENABLE ROW LEVEL SECURITY;

-- 6. Função security definer para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 7. Função para buscar empresa do gestor
CREATE OR REPLACE FUNCTION public.get_manager_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id 
  FROM public.company_managers
  WHERE user_id = _user_id
    AND status = 'active'
  LIMIT 1
$$;

-- 8. Função para validar token de convite de gestor
CREATE OR REPLACE FUNCTION public.get_manager_invite_by_token(p_token text)
RETURNS TABLE(
  id uuid,
  company_id uuid,
  email text,
  name text,
  company_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cm.id,
    cm.company_id,
    cm.email,
    cm.name,
    c.name as company_name
  FROM public.company_managers cm
  JOIN public.companies c ON c.id = cm.company_id
  WHERE cm.invite_token = p_token
    AND cm.status = 'pending'
  LIMIT 1
$$;

-- 9. Função para ativar gestor após cadastro
CREATE OR REPLACE FUNCTION public.activate_manager_invite(p_token text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_manager_id uuid;
BEGIN
  -- Buscar e atualizar o convite
  UPDATE public.company_managers
  SET 
    user_id = p_user_id,
    status = 'active',
    activated_at = now()
  WHERE invite_token = p_token
    AND status = 'pending'
  RETURNING id INTO v_manager_id;

  IF v_manager_id IS NULL THEN
    RETURN false;
  END IF;

  -- Adicionar role de company_manager
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'company_manager')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

-- 10. Função para obter estatísticas agregadas da empresa (para gestores)
CREATE OR REPLACE FUNCTION public.get_company_aggregate_stats(p_company_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se usuário tem acesso à empresa (é gestor OU facilitador)
  IF NOT EXISTS (
    SELECT 1 FROM company_managers
    WHERE company_id = p_company_id 
      AND user_id = auth.uid()
      AND status = 'active'
  ) AND NOT EXISTS (
    SELECT 1 FROM companies
    WHERE id = p_company_id
      AND facilitator_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT json_build_object(
    'total_participants', COUNT(*),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'pending', COUNT(*) FILTER (WHERE status IN ('pending', 'invited'))
  ) INTO result
  FROM participants
  WHERE company_id = p_company_id;

  RETURN result;
END;
$$;

-- 11. Função para obter médias por dimensão da empresa (para gestores)
CREATE OR REPLACE FUNCTION public.get_company_dimension_averages(p_company_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se usuário tem acesso à empresa
  IF NOT EXISTS (
    SELECT 1 FROM company_managers
    WHERE company_id = p_company_id 
      AND user_id = auth.uid()
      AND status = 'active'
  ) AND NOT EXISTS (
    SELECT 1 FROM companies
    WHERE id = p_company_id
      AND facilitator_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Calcular médias por dimensão
  WITH completed_participants AS (
    SELECT id FROM participants
    WHERE company_id = p_company_id
      AND status = 'completed'
  ),
  dimension_scores AS (
    SELECT 
      dr.participant_id,
      key as dimension,
      (value->>'score')::numeric as score
    FROM diagnostic_results dr
    CROSS JOIN LATERAL jsonb_each(dr.dimension_scores::jsonb) 
    WHERE dr.participant_id IN (SELECT id FROM completed_participants)
  )
  SELECT json_agg(
    json_build_object(
      'dimension', dimension,
      'average', ROUND(AVG(score)::numeric, 2)
    )
    ORDER BY dimension
  ) INTO result
  FROM dimension_scores
  GROUP BY dimension;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 12. Função para obter timeline de atividade recente (sem nomes)
CREATE OR REPLACE FUNCTION public.get_company_activity_timeline(p_company_id uuid, p_limit int DEFAULT 5)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Verificar se usuário tem acesso à empresa
  IF NOT EXISTS (
    SELECT 1 FROM company_managers
    WHERE company_id = p_company_id 
      AND user_id = auth.uid()
      AND status = 'active'
  ) AND NOT EXISTS (
    SELECT 1 FROM companies
    WHERE id = p_company_id
      AND facilitator_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT json_agg(activity ORDER BY completed_at DESC) INTO result
  FROM (
    SELECT 
      'Colaborador concluiu o diagnóstico' as description,
      completed_at
    FROM participants
    WHERE company_id = p_company_id
      AND status = 'completed'
      AND completed_at IS NOT NULL
    ORDER BY completed_at DESC
    LIMIT p_limit
  ) activity;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- 13. Policies para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- 14. Policies para company_managers

-- Facilitadores podem ver gestores das suas empresas
CREATE POLICY "Facilitators can view managers of their companies"
ON public.company_managers FOR SELECT
USING (
  company_id IN (
    SELECT id FROM public.companies
    WHERE facilitator_id = auth.uid()
  )
);

-- Facilitadores podem criar gestores para suas empresas
CREATE POLICY "Facilitators can create managers for their companies"
ON public.company_managers FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT id FROM public.companies
    WHERE facilitator_id = auth.uid()
  )
  AND invited_by = auth.uid()
);

-- Facilitadores podem deletar gestores das suas empresas
CREATE POLICY "Facilitators can delete managers of their companies"
ON public.company_managers FOR DELETE
USING (
  company_id IN (
    SELECT id FROM public.companies
    WHERE facilitator_id = auth.uid()
  )
);

-- Gestores podem ver seu próprio registro
CREATE POLICY "Managers can view their own record"
ON public.company_managers FOR SELECT
USING (user_id = auth.uid());

-- 15. Policy adicional para companies: gestores podem ver sua empresa
CREATE POLICY "Managers can view their company"
ON public.companies FOR SELECT
USING (
  id IN (
    SELECT company_id FROM public.company_managers
    WHERE user_id = auth.uid()
      AND status = 'active'
  )
);