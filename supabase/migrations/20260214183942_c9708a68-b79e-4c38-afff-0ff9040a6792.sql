
-- RPC for participant portal full data (by user_id)
CREATE OR REPLACE FUNCTION public.get_participant_portal_full_data(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
  v_participant_id uuid;
BEGIN
  IF NOT public.is_participant(_user_id) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT id INTO v_participant_id FROM participants WHERE user_id = _user_id LIMIT 1;

  SELECT json_build_object(
    'participant', (
      SELECT json_build_object(
        'id', p.id, 'name', p.name, 'email', p.email,
        'company_name', c.name, 'status', p.status, 'completed_at', p.completed_at
      )
      FROM participants p JOIN companies c ON c.id = p.company_id
      WHERE p.id = v_participant_id
    ),
    'facilitator', (
      SELECT json_build_object(
        'name', pr.full_name, 'calendly_url', pr.calendly_url, 'logo_url', pr.logo_url
      )
      FROM participants p LEFT JOIN profiles pr ON pr.user_id = p.facilitator_id
      WHERE p.id = v_participant_id
    ),
    'tests', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', pt.id,
          'test_name', tt.name,
          'test_slug', tt.slug,
          'test_icon', tt.icon,
          'status', pt.status,
          'created_at', pt.created_at,
          'started_at', pt.started_at,
          'completed_at', pt.completed_at,
          'result', CASE WHEN tr.id IS NOT NULL THEN
            json_build_object(
              'id', tr.id,
              'total_score', tr.total_score,
              'dimension_scores', tr.dimension_scores,
              'completed_at', tr.completed_at
            )
          ELSE NULL END
        ) ORDER BY pt.created_at DESC
      ), '[]'::json)
      FROM participant_tests pt
      JOIN test_types tt ON tt.id = pt.test_type_id
      LEFT JOIN test_results tr ON tr.participant_test_id = pt.id
      WHERE pt.participant_id = v_participant_id
    ),
    'legacy_result', (
      SELECT CASE WHEN dr.id IS NOT NULL THEN
        json_build_object(
          'id', dr.id,
          'total_score', dr.total_score,
          'dimension_scores', dr.dimension_scores,
          'completed_at', dr.completed_at
        )
      ELSE NULL END
      FROM participants p
      LEFT JOIN diagnostic_results dr ON dr.participant_id = p.id
      WHERE p.id = v_participant_id
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- RPC for admin/impersonation (by participant_id)
CREATE OR REPLACE FUNCTION public.get_participant_portal_full_data_by_id(_participant_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT json_build_object(
    'participant', (
      SELECT json_build_object(
        'id', p.id, 'name', p.name, 'email', p.email,
        'company_name', c.name, 'status', p.status, 'completed_at', p.completed_at
      )
      FROM participants p JOIN companies c ON c.id = p.company_id
      WHERE p.id = _participant_id
    ),
    'facilitator', (
      SELECT json_build_object(
        'name', pr.full_name, 'calendly_url', pr.calendly_url, 'logo_url', pr.logo_url
      )
      FROM participants p LEFT JOIN profiles pr ON pr.user_id = p.facilitator_id
      WHERE p.id = _participant_id
    ),
    'tests', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', pt.id,
          'test_name', tt.name,
          'test_slug', tt.slug,
          'test_icon', tt.icon,
          'status', pt.status,
          'created_at', pt.created_at,
          'started_at', pt.started_at,
          'completed_at', pt.completed_at,
          'result', CASE WHEN tr.id IS NOT NULL THEN
            json_build_object(
              'id', tr.id,
              'total_score', tr.total_score,
              'dimension_scores', tr.dimension_scores,
              'completed_at', tr.completed_at
            )
          ELSE NULL END
        ) ORDER BY pt.created_at DESC
      ), '[]'::json)
      FROM participant_tests pt
      JOIN test_types tt ON tt.id = pt.test_type_id
      LEFT JOIN test_results tr ON tr.participant_test_id = pt.id
      WHERE pt.participant_id = _participant_id
    ),
    'legacy_result', (
      SELECT CASE WHEN dr.id IS NOT NULL THEN
        json_build_object(
          'id', dr.id,
          'total_score', dr.total_score,
          'dimension_scores', dr.dimension_scores,
          'completed_at', dr.completed_at
        )
      ELSE NULL END
      FROM participants p
      LEFT JOIN diagnostic_results dr ON dr.participant_id = p.id
      WHERE p.id = _participant_id
    )
  ) INTO result;

  RETURN result;
END;
$$;
