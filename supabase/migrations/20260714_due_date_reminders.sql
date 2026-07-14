CREATE TABLE due_date_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_at timestamptz NOT NULL,
  sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id, reminder_at)
);

ALTER TABLE due_date_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
  ON due_date_reminders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own reminders"
  ON due_date_reminders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reminders"
  ON due_date_reminders FOR DELETE
  USING (user_id = auth.uid());
