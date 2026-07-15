-- Fix FK on task_comments: point to profiles instead of auth.users
-- so PostgREST embedding profiles!task_comments_user_id_fkey works
ALTER TABLE task_comments DROP CONSTRAINT task_comments_user_id_fkey;
ALTER TABLE task_comments ADD CONSTRAINT task_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create task_watchers table (migration was never applied)
CREATE TABLE IF NOT EXISTS task_watchers (
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
