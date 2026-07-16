CREATE OR REPLACE FUNCTION delete_account()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  DELETE FROM distraction_logs WHERE session_id IN (SELECT id FROM focus_sessions WHERE user_id = v_user_id);
  DELETE FROM focus_sessions WHERE user_id = v_user_id;
  DELETE FROM activity_logs WHERE user_id = v_user_id;
  DELETE FROM document_comments WHERE user_id = v_user_id;
  DELETE FROM documents WHERE created_by = v_user_id;
  DELETE FROM goals WHERE user_id = v_user_id;
  DELETE FROM notifications WHERE user_id = v_user_id;
  DELETE FROM profiles WHERE id = v_user_id;

  DELETE FROM workspaces WHERE created_by = v_user_id;

  DELETE FROM workspace_members WHERE user_id = v_user_id;

  DELETE FROM auth.users WHERE id = v_user_id;

  RETURN json_build_object('success', true);
END;
$$;
