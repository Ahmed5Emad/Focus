ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_seen boolean DEFAULT false;

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
