-- =============================================
-- insights 테이블 보강 마이그레이션
-- =============================================
-- 시리즈 연결을 위한 series_ids 컬럼 추가
-- (기존 insights 테이블이 이미 있는 경우 대비)

ALTER TABLE insights ADD COLUMN IF NOT EXISTS series_ids UUID[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_insights_series_ids ON insights USING GIN(series_ids);
