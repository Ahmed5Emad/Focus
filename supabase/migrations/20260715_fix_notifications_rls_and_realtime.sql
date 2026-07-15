-- Add INSERT policy for notifications (was missing, blocking all inserts)
CREATE POLICY "Users can insert notifications for themselves"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Add notifications table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
