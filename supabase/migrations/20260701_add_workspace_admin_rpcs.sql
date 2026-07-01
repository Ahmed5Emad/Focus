CREATE OR REPLACE FUNCTION delete_workspace(p_workspace_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role
  FROM workspace_members
  WHERE workspace_id = p_workspace_id AND user_id = auth.uid();

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Not a member of this workspace';
  END IF;

  IF v_role != 'owner' AND v_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins and owners can delete workspaces';
  END IF;

  DELETE FROM focus_sessions WHERE workspace_id = p_workspace_id;
  DELETE FROM direct_messages WHERE workspace_id = p_workspace_id;
  DELETE FROM chat_messages WHERE workspace_id = p_workspace_id;
  DELETE FROM tasks WHERE workspace_id = p_workspace_id;
  DELETE FROM goals WHERE workspace_id = p_workspace_id;
  DELETE FROM projects WHERE workspace_id = p_workspace_id;
  DELETE FROM workspace_members WHERE workspace_id = p_workspace_id;
  DELETE FROM workspaces WHERE id = p_workspace_id;

  RETURN '{"success": true}'::JSONB;
END;
$$;

CREATE OR REPLACE FUNCTION update_workspace_name(p_workspace_id UUID, p_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role
  FROM workspace_members
  WHERE workspace_id = p_workspace_id AND user_id = auth.uid();

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Not a member of this workspace';
  END IF;

  IF v_role != 'owner' AND v_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins and owners can rename workspaces';
  END IF;

  UPDATE workspaces SET name = p_name WHERE id = p_workspace_id;
  RETURN '{"success": true}'::JSONB;
END;
$$;
