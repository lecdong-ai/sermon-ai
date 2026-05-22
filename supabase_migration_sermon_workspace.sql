-- =============================================
-- 설교 준비 워크스페이스 — DB 마이그레이션 v2
-- =============================================
-- 기존 sermons 테이블에 새 컬럼 추가
-- 새로운 테이블 5개 생성

-- ─── 1. 기존 sermons 테이블 확장 ───

ALTER TABLE sermons ADD COLUMN IF NOT EXISTS book TEXT;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS chapter_start INT;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS chapter_end INT;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS verse_start INT;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS verse_end INT;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS sermon_date DATE;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS series TEXT;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS season TEXT;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS audience TEXT[] DEFAULT '{}';
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS church_context TEXT;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sermons_status_check'
    AND conrelid = 'sermons'::regclass
  ) THEN
    ALTER TABLE sermons ADD CONSTRAINT sermons_status_check
      CHECK (status IN ('draft', 'in_progress', 'completed'));
  END IF;
END $$;

-- ─── 2. sermon_notes ───
CREATE TABLE IF NOT EXISTS sermon_notes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id           UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  core_message        TEXT,
  observation_notes   TEXT,
  background_notes    TEXT,
  interpretation_notes TEXT,
  illustration_notes  TEXT,
  application_points  TEXT,
  UNIQUE(sermon_id)
);

-- ─── 3. sermon_outlines ───
CREATE TABLE IF NOT EXISTS sermon_outlines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id       UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  introduction    TEXT,
  conclusion      TEXT,
  main_points     JSONB DEFAULT '[]',
  UNIQUE(sermon_id)
);

-- ─── 4. sermon_manuscripts ───
CREATE TABLE IF NOT EXISTS sermon_manuscripts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id   UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  content     TEXT,
  word_count  INT,
  UNIQUE(sermon_id)
);

-- ─── 5. sermon_versions ───
CREATE TABLE IF NOT EXISTS sermon_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id   UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  version     INT NOT NULL,
  snapshot    JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── 6. generated_outputs ───
CREATE TABLE IF NOT EXISTS generated_outputs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id   UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  input_data  JSONB,
  output_data JSONB NOT NULL,
  user_action TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── 인덱스 ───
CREATE INDEX IF NOT EXISTS idx_sermons_user_id ON sermons(user_id);
CREATE INDEX IF NOT EXISTS idx_sermons_status ON sermons(status);
CREATE INDEX IF NOT EXISTS idx_sermons_sermon_date ON sermons(sermon_date DESC);
CREATE INDEX IF NOT EXISTS idx_sermon_notes_sermon ON sermon_notes(sermon_id);
CREATE INDEX IF NOT EXISTS idx_sermon_outlines_sermon ON sermon_outlines(sermon_id);
CREATE INDEX IF NOT EXISTS idx_sermon_manuscripts_sermon ON sermon_manuscripts(sermon_id);
CREATE INDEX IF NOT EXISTS idx_sermon_versions_sermon ON sermon_versions(sermon_id, version);
CREATE INDEX IF NOT EXISTS idx_generated_outputs_sermon ON generated_outputs(sermon_id, type);

-- ─── RLS ───
ALTER TABLE sermon_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_outputs ENABLE ROW LEVEL SECURITY;

-- sermon_notes policies
DROP POLICY IF EXISTS "sermon_notes_select" ON sermon_notes;
CREATE POLICY "sermon_notes_select" ON sermon_notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_notes.sermon_id AND sermons.user_id = auth.uid()));

DROP POLICY IF EXISTS "sermon_notes_insert" ON sermon_notes;
CREATE POLICY "sermon_notes_insert" ON sermon_notes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_notes.sermon_id AND sermons.user_id = auth.uid()));

DROP POLICY IF EXISTS "sermon_notes_update" ON sermon_notes;
CREATE POLICY "sermon_notes_update" ON sermon_notes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_notes.sermon_id AND sermons.user_id = auth.uid()));

DROP POLICY IF EXISTS "sermon_notes_delete" ON sermon_notes;
CREATE POLICY "sermon_notes_delete" ON sermon_notes FOR DELETE
  USING (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_notes.sermon_id AND sermons.user_id = auth.uid()));

-- sermon_outlines policies
DROP POLICY IF EXISTS "sermon_outlines_select" ON sermon_outlines;
CREATE POLICY "sermon_outlines_select" ON sermon_outlines FOR SELECT
  USING (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_outlines.sermon_id AND sermons.user_id = auth.uid()));

DROP POLICY IF EXISTS "sermon_outlines_insert" ON sermon_outlines;
CREATE POLICY "sermon_outlines_insert" ON sermon_outlines FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_outlines.sermon_id AND sermons.user_id = auth.uid()));

DROP POLICY IF EXISTS "sermon_outlines_update" ON sermon_outlines;
CREATE POLICY "sermon_outlines_update" ON sermon_outlines FOR UPDATE
  USING (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_outlines.sermon_id AND sermons.user_id = auth.uid()));

DROP POLICY IF EXISTS "sermon_outlines_delete" ON sermon_outlines;
CREATE POLICY "sermon_outlines_delete" ON sermon_outlines FOR DELETE
  USING (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_outlines.sermon_id AND sermons.user_id = auth.uid()));

-- sermon_manuscripts policies
DROP POLICY IF EXISTS "sermon_manuscripts_select" ON sermon_manuscripts;
CREATE POLICY "sermon_manuscripts_select" ON sermon_manuscripts FOR SELECT
  USING (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_manuscripts.sermon_id AND sermons.user_id = auth.uid()));

DROP POLICY IF EXISTS "sermon_manuscripts_insert" ON sermon_manuscripts;
CREATE POLICY "sermon_manuscripts_insert" ON sermon_manuscripts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_manuscripts.sermon_id AND sermons.user_id = auth.uid()));

DROP POLICY IF EXISTS "sermon_manuscripts_update" ON sermon_manuscripts;
CREATE POLICY "sermon_manuscripts_update" ON sermon_manuscripts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_manuscripts.sermon_id AND sermons.user_id = auth.uid()));

DROP POLICY IF EXISTS "sermon_manuscripts_delete" ON sermon_manuscripts;
CREATE POLICY "sermon_manuscripts_delete" ON sermon_manuscripts FOR DELETE
  USING (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_manuscripts.sermon_id AND sermons.user_id = auth.uid()));

-- sermon_versions policies
DROP POLICY IF EXISTS "sermon_versions_select" ON sermon_versions;
CREATE POLICY "sermon_versions_select" ON sermon_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_versions.sermon_id AND sermons.user_id = auth.uid()));

DROP POLICY IF EXISTS "sermon_versions_insert" ON sermon_versions;
CREATE POLICY "sermon_versions_insert" ON sermon_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = sermon_versions.sermon_id AND sermons.user_id = auth.uid()));

-- generated_outputs policies
DROP POLICY IF EXISTS "generated_outputs_select" ON generated_outputs;
CREATE POLICY "generated_outputs_select" ON generated_outputs FOR SELECT
  USING (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = generated_outputs.sermon_id AND sermons.user_id = auth.uid()));

DROP POLICY IF EXISTS "generated_outputs_insert" ON generated_outputs;
CREATE POLICY "generated_outputs_insert" ON generated_outputs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sermons WHERE sermons.id = generated_outputs.sermon_id AND sermons.user_id = auth.uid()));
