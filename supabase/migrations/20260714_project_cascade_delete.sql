ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_goal_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_goal_id_fkey
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL;
