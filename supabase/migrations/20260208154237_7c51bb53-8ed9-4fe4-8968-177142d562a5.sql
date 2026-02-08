-- Function to check if user is participant using text comparison
CREATE OR REPLACE FUNCTION public.is_participant(_user_id uuid)
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
      AND role::text = 'participant'
  )
$$;

-- Function to get participant data for portal
CREATE OR REPLACE FUNCTION public.get_participant_portal_data(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Verify user is a participant
  IF NOT public.is_participant(_user_id) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT json_build_object(
    'participant', json_build_object(
      'id', p.id,
      'name', p.name,
      'email', p.email,
      'company_name', c.name,
      'status', p.status,
      'completed_at', p.completed_at
    ),
    'result', CASE 
      WHEN dr.id IS NOT NULL THEN json_build_object(
        'id', dr.id,
        'total_score', dr.total_score,
        'dimension_scores', dr.dimension_scores,
        'completed_at', dr.completed_at
      )
      ELSE NULL
    END,
    'facilitator', json_build_object(
      'name', pr.full_name,
      'calendly_url', pr.calendly_url,
      'logo_url', pr.logo_url
    )
  ) INTO result
  FROM public.participants p
  JOIN public.companies c ON c.id = p.company_id
  LEFT JOIN public.diagnostic_results dr ON dr.participant_id = p.id
  LEFT JOIN public.profiles pr ON pr.user_id = p.facilitator_id
  WHERE p.user_id = _user_id
  LIMIT 1;

  RETURN result;
END;
$$;