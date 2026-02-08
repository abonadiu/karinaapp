-- Drop and recreate the function with fixed column names
DROP FUNCTION IF EXISTS public.get_company_participants_anonymized(uuid, text);

CREATE FUNCTION public.get_company_participants_anonymized(
  p_company_id uuid,
  p_status text DEFAULT NULL
)
RETURNS TABLE (
  row_num bigint,
  participant_status text,
  participant_department text,
  participant_completed_at timestamptz,
  participant_started_at timestamptz,
  participant_invited_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user has access to the company (manager or facilitator)
  IF NOT EXISTS (
    SELECT 1 FROM company_managers cm
    WHERE cm.company_id = p_company_id 
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
  ) AND NOT EXISTS (
    SELECT 1 FROM companies c
    WHERE c.id = p_company_id
      AND c.facilitator_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  SELECT 
    row_number() OVER (ORDER BY p.created_at) as row_num,
    p.status::text as participant_status,
    p.department as participant_department,
    p.completed_at as participant_completed_at,
    p.started_at as participant_started_at,
    p.invited_at as participant_invited_at
  FROM participants p
  WHERE p.company_id = p_company_id
    AND (p_status IS NULL OR p.status = p_status OR 
         (p_status = 'pending' AND p.status IN ('pending', 'invited')))
  ORDER BY p.created_at;
END;
$$;