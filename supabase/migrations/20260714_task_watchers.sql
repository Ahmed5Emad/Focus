CREATE TABLE task_watchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

ALTER TABLE task_watchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view watchers for tasks in their workspace"
  ON task_watchers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_watchers.task_id
      AND tasks.workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own watcher entries"
  ON task_watchers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own watcher entries"
  ON task_watchers FOR DELETE
  USING (user_id = auth.uid());
