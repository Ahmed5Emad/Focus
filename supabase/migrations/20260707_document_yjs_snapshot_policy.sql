-- Allow any workspace member to update documents (needed for Hocuspocus server to persist yjs_snapshot)
DROP POLICY IF EXISTS "documents_update_own_or_admin" ON documents;
CREATE POLICY "documents_update_own_or_admin" ON documents
  FOR UPDATE
  USING (workspace_id IN (
    SELECT workspace_members.workspace_id FROM workspace_members WHERE workspace_members.user_id = auth.uid()
  ))
  WITH CHECK (workspace_id IN (
    SELECT workspace_members.workspace_id FROM workspace_members WHERE workspace_members.user_id = auth.uid()
  ));
