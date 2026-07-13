ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(workspace_id, position);
