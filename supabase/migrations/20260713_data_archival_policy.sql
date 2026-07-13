-- Auto-archive tasks that have been "done" for more than 90 days
CREATE OR REPLACE FUNCTION auto_archive_completed_tasks()
RETURNS void AS $$
BEGIN
  UPDATE tasks
  SET is_archived = true, archived_at = NOW(), updated_at = NOW()
  WHERE status = 'done'
    AND is_archived = false
    AND completed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Clean up abandoned focus sessions older than 30 days
CREATE OR REPLACE FUNCTION cleanup_abandoned_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM distraction_logs
  WHERE session_id IN (
    SELECT id FROM focus_sessions
    WHERE status = 'abandoned'
      AND start_time < NOW() - INTERVAL '30 days'
  );

  DELETE FROM focus_sessions
  WHERE status = 'abandoned'
    AND start_time < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the archival job to run daily via pg_cron
SELECT cron.schedule('auto-archive-tasks', '0 3 * * *', 'SELECT auto_archive_completed_tasks();');
SELECT cron.schedule('cleanup-sessions', '0 4 * * 0', 'SELECT cleanup_abandoned_sessions();');
