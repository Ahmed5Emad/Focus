DROP FUNCTION IF EXISTS invite_user_to_workspace(text, uuid, text);
DROP FUNCTION IF EXISTS invite_user_to_workspace(text, uuid, user_role);

CREATE OR REPLACE FUNCTION invite_user_to_workspace(
  p_email TEXT,
  p_workspace_id UUID,
  p_role TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_member_id UUID;
  v_caller_role TEXT;
BEGIN
  SELECT role INTO v_caller_role
  FROM workspace_members
  WHERE workspace_id = p_workspace_id AND user_id = auth.uid();

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin', 'sub admin') THEN
    RETURN json_build_object('success', false, 'error', 'Permission denied');
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  IF EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = v_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'User is already a member');
  END IF;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (p_workspace_id, v_user_id, p_role::user_role)
  RETURNING id INTO v_member_id;

  RETURN json_build_object('success', true, 'member_id', v_member_id);
END;
$$;
