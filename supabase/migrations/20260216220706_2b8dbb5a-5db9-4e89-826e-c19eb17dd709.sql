CREATE OR REPLACE FUNCTION public.activate_participant_account(p_token text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_participant_id uuid;
BEGIN
  SELECT id INTO v_participant_id
  FROM participants
  WHERE access_token = p_token AND user_id IS NULL;

  IF v_participant_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE participants SET user_id = p_user_id WHERE id = v_participant_id;

  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, 'participant')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;