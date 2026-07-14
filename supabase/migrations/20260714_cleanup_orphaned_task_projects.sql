-- Clean up tasks referencing projects that no longer exist.
-- This cascade-deletes task_comments, task_watchers, and task_dependencies.
DELETE FROM tasks WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects);
