-- =============================================
-- Add 'word' to insights type CHECK constraint
-- =============================================
-- 통찰 노트에 '원어 단어' 유형 추가 (study 탭에서 원어 → 노트로 저장 기능)

DO $$
BEGIN
  -- 기존 제약이 있으면 삭제하고 새로 추가 (CHECK 안의 값 목록 업데이트)
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'insights_type_check') THEN
    ALTER TABLE insights DROP CONSTRAINT insights_type_check;
  END IF;

  ALTER TABLE insights ADD CONSTRAINT insights_type_check
    CHECK (type IN ('insight', 'research', 'application', 'question', 'pastoral', 'illustration', 'warning', 'word'));
END $$;

-- Supabase SQL Editor에서 직접 실행:
-- 1) Supabase 대시보드 → SQL Editor → New query
-- 2) 위 SQL 붙여넣기 → Run
