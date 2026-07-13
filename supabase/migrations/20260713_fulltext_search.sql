-- Add tsvector columns for full-text search
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS search_vector tsvector 
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED;

ALTER TABLE goals ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))) STORED;

-- Create GIN indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_tasks_search ON tasks USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_goals_search ON goals USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_documents_search ON documents USING GIN(search_vector);

-- Create a search RPC function
CREATE OR REPLACE FUNCTION global_search(p_workspace_id uuid, p_query text)
RETURNS TABLE(result_type text, result_id uuid, title text, description text, url text, rank real) AS $$
BEGIN
  RETURN QUERY
  SELECT 'task'::text, t.id, t.title, t.description, '/tasks'::text, ts_rank(t.search_vector, q.query) as rank
  FROM tasks t, plainto_tsquery('english', p_query) q
  WHERE t.workspace_id = p_workspace_id AND t.search_vector @@ q AND t.is_archived = false
  UNION ALL
  SELECT 'project'::text, p.id, p.title, p.description, '/projects'::text, ts_rank(p.search_vector, q.query)
  FROM projects p, plainto_tsquery('english', p_query) q
  WHERE p.workspace_id = p_workspace_id AND p.search_vector @@ q
  UNION ALL
  SELECT 'goal'::text, g.id, g.title, g.description, '/goals'::text, ts_rank(g.search_vector, q.query)
  FROM goals g, plainto_tsquery('english', p_query) q
  WHERE g.workspace_id = p_workspace_id AND g.search_vector @@ q
  UNION ALL
  SELECT 'document'::text, d.id, d.title, NULL::text, '/documents'::text, ts_rank(d.search_vector, q.query)
  FROM documents d, plainto_tsquery('english', p_query) q
  WHERE d.workspace_id = p_workspace_id AND d.search_vector @@ q
  ORDER BY rank DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
