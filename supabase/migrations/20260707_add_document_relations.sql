ALTER TABLE documents ADD COLUMN IF NOT EXISTS project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_task ON documents(task_id);
