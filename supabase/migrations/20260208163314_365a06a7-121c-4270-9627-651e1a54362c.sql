-- Function to get participant portal data by participant ID (for admin impersonation)
CREATE OR REPLACE FUNCTION public.get_participant_portal_data_by_id(_participant_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
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
  WHERE p.id = _participant_id
  LIMIT 1;

  RETURN result;
END;
$$;