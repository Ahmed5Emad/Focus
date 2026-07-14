-- CASCADE FK is in place from 20260714_project_cascade_delete.sql,
-- so deleting these projects will cascade to tasks, documents, etc.
DELETE FROM projects WHERE title IN ('testing', 'ALi', 'aaa');
