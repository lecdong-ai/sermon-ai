-- =============================================
-- 워크스페이스 사용량 관리 — DB 마이그레이션
-- =============================================
-- user_usage 테이블에 workspace_used, workspace_limit 컬럼 추가

ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS workspace_used INT NOT NULL DEFAULT 0;
ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS workspace_limit INT NOT NULL DEFAULT 0;

-- 기존 사용자에게 기본값 설정
-- Basic: workspace_limit = 10, Pro: workspace_limit = 20
UPDATE user_usage SET workspace_limit = 10 WHERE plan = 'basic';
UPDATE user_usage SET workspace_limit = 20 WHERE plan = 'pro';
