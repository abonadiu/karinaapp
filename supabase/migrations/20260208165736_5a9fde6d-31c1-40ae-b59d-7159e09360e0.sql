-- Create function to get anonymized participant list for company portal
CREATE OR REPLACE FUNCTION public.get_company_participants_anonymized(
  p_company_id uuid,
  p_status text DEFAULT NULL
)
RETURNS TABLE (
  row_number bigint,
  status text,
  department text,
  completed_at timestamptz,
  started_at timestamptz,
  invited_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user has access to the company (manager or facilitator)
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

  RETURN QUERY
  SELECT 
    row_number() OVER (ORDER BY p.created_at) as row_number,
    p.status::text,
    p.department,
    p.completed_at,
    p.started_at,
    p.invited_at
  FROM participants p
  WHERE p.company_id = p_company_id
    AND (p_status IS NULL OR p.status = p_status OR 
         (p_status = 'pending' AND p.status IN ('pending', 'invited')))
  ORDER BY p.created_at;
END;
$$;