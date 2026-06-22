-- =============================================
-- 한 번에 실행 마이그레이션 (2026-06-21)
-- =============================================
-- 다음 3개 마이그레이션을 한 번에 실행:
--   1. insights (통찰 노트) 테이블
--   2. insights.series_ids 컬럼
--   3. series.is_sample 컬럼
--
-- 모두 IF NOT EXISTS로 작성되어 있어
-- 이미 실행한 부분이 있어도 안전합니다.

-- ─────────── 1. insights 테이블 ───────────
CREATE TABLE IF NOT EXISTS insights (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  title               TEXT NOT NULL,
  content             TEXT NOT NULL,
  summary             TEXT NOT NULL DEFAULT '',
  tags                TEXT[] NOT NULL DEFAULT '{}',
  starred             BOOLEAN NOT NULL DEFAULT false,
  pinned              BOOLEAN NOT NULL DEFAULT false,
  connections         JSONB NOT NULL DEFAULT '[]'::jsonb,
  project_ids         UUID[] NOT NULL DEFAULT '{}',
  series_ids          UUID[] NOT NULL DEFAULT '{}',
  archive_ids         UUID[] NOT NULL DEFAULT '{}',
  last_referenced_at  TIMESTAMPTZ,
  reference_count     INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'insights_type_check') THEN
    ALTER TABLE insights ADD CONSTRAINT insights_type_check
      CHECK (type IN ('insight', 'research', 'application', 'question', 'pastoral', 'illustration', 'warning', 'word'));
  ELSE
    -- 기존 constraint에 'word'가 없으면 재생성
    ALTER TABLE insights DROP CONSTRAINT insights_type_check;
    ALTER TABLE insights ADD CONSTRAINT insights_type_check
      CHECK (type IN ('insight', 'research', 'application', 'question', 'pastoral', 'illustration', 'warning', 'word'));
  END IF;
END $$;

ALTER TABLE insights ADD COLUMN IF NOT EXISTS series_ids UUID[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_insights_user_id    ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_updated_at ON insights(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_pinned     ON insights(user_id) WHERE pinned = true;
CREATE INDEX IF NOT EXISTS idx_insights_starred    ON insights(user_id) WHERE starred = true;
CREATE INDEX IF NOT EXISTS idx_insights_type       ON insights(user_id, type);
CREATE INDEX IF NOT EXISTS idx_insights_tags       ON insights USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_insights_project_ids ON insights USING GIN(project_ids);
CREATE INDEX IF NOT EXISTS idx_insights_series_ids  ON insights USING GIN(series_ids);
CREATE INDEX IF NOT EXISTS idx_insights_search     ON insights USING GIN(to_tsvector('simple', title || ' ' || content));

CREATE OR REPLACE FUNCTION update_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_insights_updated_at ON insights;
CREATE TRIGGER trg_insights_updated_at
  BEFORE UPDATE ON insights
  FOR EACH ROW
  EXECUTE FUNCTION update_insights_updated_at();

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insights_select" ON insights;
CREATE POLICY "insights_select" ON insights FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "insights_insert" ON insights;
CREATE POLICY "insights_insert" ON insights FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "insights_update" ON insights;
CREATE POLICY "insights_update" ON insights FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "insights_delete" ON insights;
CREATE POLICY "insights_delete" ON insights FOR DELETE USING (user_id = auth.uid());

-- ─────────── 2. series.is_sample 컬럼 ───────────
ALTER TABLE series ADD COLUMN IF NOT EXISTS is_sample BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_series_is_sample ON series(user_id, is_sample) WHERE is_sample = true;

-- =============================================
-- 완료!
-- =============================================
-- 결과: "Success. No rows returned" 가 보여야 정상
-- 3개 작업 모두 완료
