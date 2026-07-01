ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
