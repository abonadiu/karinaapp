-- Função para calcular benchmark global (médias de todos os diagnósticos)
CREATE OR REPLACE FUNCTION get_global_benchmark()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Médias globais por dimensão
  WITH dimension_avgs AS (
    SELECT 
      key as dimension,
      AVG((value->>'score')::numeric) as avg_score
    FROM diagnostic_results,
         jsonb_each(dimension_scores::jsonb)
    GROUP BY key
  ),
  global_avg AS (
    SELECT AVG(total_score) as global_score
    FROM diagnostic_results
  )
  SELECT json_build_object(
    'dimensions', (SELECT json_agg(json_build_object(
      'dimension', dimension,
      'average', ROUND(avg_score::numeric, 2)
    )) FROM dimension_avgs),
    'global_average', (SELECT ROUND(global_score::numeric, 2) FROM global_avg),
    'total_completed', (SELECT COUNT(*) FROM diagnostic_results)
  ) INTO result;

  RETURN result;
END;
$$;

-- Função para calcular percentil da empresa em relação às outras
CREATE OR REPLACE FUNCTION get_company_percentile(p_company_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  company_avg numeric;
  percentile integer;
BEGIN
  -- Média da empresa
  SELECT AVG(dr.total_score) INTO company_avg
  FROM diagnostic_results dr
  JOIN participants p ON p.id = dr.participant_id
  WHERE p.company_id = p_company_id;

  IF company_avg IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calcular percentil (porcentagem de empresas com média <= à média desta empresa)
  SELECT ROUND(
    (COUNT(*) FILTER (WHERE avg_score <= company_avg)::numeric / 
     NULLIF(COUNT(*), 0)) * 100
  )::integer INTO percentile
  FROM (
    SELECT p.company_id, AVG(dr.total_score) as avg_score
    FROM diagnostic_results dr
    JOIN participants p ON p.id = dr.participant_id
    GROUP BY p.company_id
  ) company_scores;

  RETURN percentile;
END;
$$;