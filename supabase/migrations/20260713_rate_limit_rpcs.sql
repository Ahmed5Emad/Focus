-- Rate limiting for workspace creation (max 10 per hour per user)
CREATE OR REPLACE FUNCTION check_workspace_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM workspaces WHERE created_by = NEW.created_by AND created_at > NOW() - INTERVAL '1 hour') > 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 10 workspaces per hour';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_workspace_rate_limit ON workspaces;
CREATE TRIGGER trg_workspace_rate_limit
  BEFORE INSERT ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION check_workspace_rate_limit();

-- Rate limiting for task creation per user per workspace (max 100 per hour)
CREATE OR REPLACE FUNCTION check_task_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM tasks WHERE assignee_id = NEW.assignee_id AND workspace_id = NEW.workspace_id AND created_at > NOW() - INTERVAL '1 hour') > 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 100 tasks per hour';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_task_rate_limit ON tasks;
CREATE TRIGGER trg_task_rate_limit
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_task_rate_limit();
