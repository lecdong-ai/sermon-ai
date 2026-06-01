-- =============================================
-- 설교 출처 구분 컬럼 추가
-- =============================================

ALTER TABLE sermons ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
CREATE INDEX IF NOT EXISTS idx_sermons_source ON sermons(source);
