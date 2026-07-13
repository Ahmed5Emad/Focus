DROP FUNCTION IF EXISTS get_dashboard_stats(UUID);

CREATE OR REPLACE FUNCTION get_dashboard_stats(p_workspace_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  today_flow NUMERIC;
  yesterday_flow NUMERIC;
  result JSON;
BEGIN
  SELECT COALESCE(AVG(flow_score), 0) INTO today_flow
  FROM focus_sessions
  WHERE workspace_id = p_workspace_id
    AND user_id = v_user_id
    AND status IN ('completed', 'abandoned')
    AND start_time::date = CURRENT_DATE;

  SELECT COALESCE(AVG(flow_score), 0) INTO yesterday_flow
  FROM focus_sessions
  WHERE workspace_id = p_workspace_id
    AND user_id = v_user_id
    AND status IN ('completed', 'abandoned')
    AND start_time::date = CURRENT_DATE - INTERVAL '1 day';

  SELECT json_build_object(
    'avg_flow_score', COALESCE(
      (SELECT AVG(flow_score) FROM focus_sessions
       WHERE workspace_id = p_workspace_id
         AND user_id = v_user_id
         AND status IN ('completed', 'abandoned')
         AND start_time::date = CURRENT_DATE),
      0
    ),
    'today_deep_work_seconds', COALESCE(
      (SELECT SUM(actual_duration_seconds) FROM focus_sessions
       WHERE workspace_id = p_workspace_id
         AND user_id = v_user_id
         AND status IN ('completed', 'abandoned', 'active')
         AND start_time::date = CURRENT_DATE),
      0
    ),
    'tasks_completed', (
      SELECT COUNT(*) FROM tasks
      WHERE workspace_id = p_workspace_id
        AND status = 'done'
    ),
    'tasks_total', (
      SELECT COUNT(*) FROM tasks
      WHERE workspace_id = p_workspace_id
        AND (is_archived IS NULL OR is_archived = false)
    ),
    'flow_score_change', (today_flow - yesterday_flow)
  ) INTO result;

  RETURN result;
END;
$$;
