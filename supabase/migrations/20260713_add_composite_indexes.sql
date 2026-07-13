CREATE INDEX IF NOT EXISTS idx_tasks_workspace_status ON tasks(workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_workspace_assignee ON tasks(workspace_id, assignee_id);

CREATE INDEX IF NOT EXISTS idx_tasks_workspace_archived ON tasks(workspace_id, is_archived);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_status ON focus_sessions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_task_duration ON focus_sessions(task_id, actual_duration_seconds);

CREATE INDEX IF NOT EXISTS idx_chat_messages_workspace ON chat_messages(workspace_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_documents_workspace ON documents(workspace_id);
