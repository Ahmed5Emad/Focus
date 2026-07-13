-- Custom workflow statuses per workspace
CREATE TABLE IF NOT EXISTS workflow_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#7b68ee',
  position integer NOT NULL DEFAULT 0,
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, name)
);

CREATE INDEX IF NOT EXISTS idx_workflow_statuses_workspace ON workflow_statuses(workspace_id, position);

-- Custom field definitions per workspace
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  options jsonb DEFAULT '[]'::jsonb,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, name)
);

CREATE INDEX IF NOT EXISTS idx_custom_fields_workspace ON custom_fields(workspace_id, position);

-- Custom field values on tasks
CREATE TABLE IF NOT EXISTS task_custom_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(task_id, field_id)
);

CREATE INDEX IF NOT EXISTS idx_task_custom_values_task ON task_custom_values(task_id);
