-- qt_history publishing support
-- 1. public columns
ALTER TABLE qt_history ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE qt_history ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE qt_history ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- 2. drop FK + NOT NULL (service_role can insert without user_id)
ALTER TABLE qt_history DROP CONSTRAINT IF EXISTS qt_history_user_id_fkey;
ALTER TABLE qt_history ALTER COLUMN user_id DROP NOT NULL;

-- 3. RLS: anyone can SELECT published entries
DROP POLICY IF EXISTS "Anyone can view published qt_history" ON qt_history;
CREATE POLICY "Anyone can view published qt_history"
  ON qt_history FOR SELECT
  USING (is_published = true);

-- 4. index
CREATE INDEX IF NOT EXISTS idx_qt_history_published
  ON qt_history(is_published, created_at DESC);
