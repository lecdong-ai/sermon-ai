-- =============================================
-- series 테이블 보강 마이그레이션
-- =============================================
-- is_sample 컬럼: 샘플/시드 데이터 표시용
-- 일괄 삭제 시 본인 데이터는 안전하게 보호

ALTER TABLE series ADD COLUMN IF NOT EXISTS is_sample BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_series_is_sample ON series(user_id, is_sample) WHERE is_sample = true;
