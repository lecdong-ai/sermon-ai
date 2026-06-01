-- =============================================
-- 시리즈 테이블 생성 — user_id 기준 분리
-- =============================================

CREATE TABLE IF NOT EXISTS series (
  id          TEXT PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  start_date  TEXT,
  end_date    TEXT,
  status      TEXT DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "series_select" ON series;
CREATE POLICY "series_select" ON series FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "series_insert" ON series;
CREATE POLICY "series_insert" ON series FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "series_update" ON series;
CREATE POLICY "series_update" ON series FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "series_delete" ON series;
CREATE POLICY "series_delete" ON series FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_series_user_id ON series(user_id);
