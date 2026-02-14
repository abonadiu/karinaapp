
-- Adicionar coluna self_register_token na tabela companies
ALTER TABLE public.companies
ADD COLUMN self_register_token text UNIQUE DEFAULT (gen_random_uuid())::text;

-- Preencher tokens para empresas existentes
UPDATE public.companies SET self_register_token = (gen_random_uuid())::text WHERE self_register_token IS NULL;

-- Tornar NOT NULL após preencher
ALTER TABLE public.companies ALTER COLUMN self_register_token SET NOT NULL;

-- Índice para buscas rápidas
CREATE UNIQUE INDEX idx_companies_self_register_token ON public.companies (self_register_token);

-- Função SECURITY DEFINER para autocadastro anônimo
CREATE OR REPLACE FUNCTION public.self_register_participant(
  p_token text,
  p_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_department text DEFAULT NULL,
  p_position text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
  v_facilitator_id uuid;
  v_participant_id uuid;
BEGIN
  SELECT id, facilitator_id INTO v_company_id, v_facilitator_id
  FROM companies
  WHERE self_register_token = p_token;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Link inválido';
  END IF;

  -- Verificar se email já existe nessa empresa
  IF EXISTS (SELECT 1 FROM participants WHERE email = p_email AND company_id = v_company_id) THEN
    RAISE EXCEPTION 'Este email já está cadastrado nesta empresa';
  END IF;

  INSERT INTO participants (name, email, phone, department, position, company_id, facilitator_id)
  VALUES (p_name, p_email, p_phone, p_department, p_position, v_company_id, v_facilitator_id)
  RETURNING id INTO v_participant_id;

  RETURN v_participant_id;
END;
$$;
