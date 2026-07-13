ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;
