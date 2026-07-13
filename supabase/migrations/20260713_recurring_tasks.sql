-- Task templates (must exist before FK reference)
CREATE TABLE IF NOT EXISTS task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  task_title text NOT NULL,
  task_description text,
  task_priority text DEFAULT 'none',
  subtask_templates jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_templates_workspace ON task_templates(workspace_id);

-- Recurring tasks configuration
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_rule text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_end_date timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_recurrence_at timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES task_templates(id) ON DELETE SET NULL;
