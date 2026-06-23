-- =============================================
-- 회원 등급별 한도 시스템 (Phase 1)
-- =============================================
-- 일반 회원: AI 분석 6종 10편/30일, 새 설교 등록 10편/30일,
--           말씀 연구실 1편/30일, 유튜브 1회/30일
-- 사역 동참자: 각각 20편/20편/20편/10회/30일
-- 리셋: 가입일 기준 30일 롤링
--
-- 한도 값은 user_usage에 저장, 실제 카운트는 DB의 COUNT 쿼리로 계산

-- 1) 한도 컬럼 추가
ALTER TABLE user_usage
  ADD COLUMN IF NOT EXISTS ai_analysis_limit int NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS manual_sermon_limit int NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS project_limit int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS youtube_limit int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signup_date timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS grace_period_end timestamptz;

-- 2) 코멘트
COMMENT ON COLUMN user_usage.ai_analysis_limit IS '월간 AI 분석 6종 한도 (10=일반, 20=사역)';
COMMENT ON COLUMN user_usage.manual_sermon_limit IS '월간 manual 설교 등록 한도 (10=일반, 20=사역)';
COMMENT ON COLUMN user_usage.project_limit IS '월간 설교 프로젝트 한도 (0=일반, 20=사역)';
COMMENT ON COLUMN user_usage.youtube_limit IS '월간 유튜브 분석 한도 (0=일반, 10=사역)';
COMMENT ON COLUMN user_usage.signup_date IS '가입일 (30일 롤링 기간 계산 기준)';
COMMENT ON COLUMN user_usage.grace_period_end IS '기존 사용자 유예 종료일. NULL=신규 정책 즉시 적용';

-- 3) 인덱스: 카운트 쿼리 최적화
-- sermons: (user_id, source, created_at)
CREATE INDEX IF NOT EXISTS idx_sermons_user_source_created
  ON sermons(user_id, source, created_at DESC);

-- sermons: (user_id, created_at) — 한도 검사 시
CREATE INDEX IF NOT EXISTS idx_sermons_user_created
  ON sermons(user_id, created_at DESC);

-- 4) 신규 가입 트리거 보강: 한도 컬럼 + signup_date 자동 설정
-- 기존 handle_new_user 함수를 REPLACE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_usage (id, email, signup_date, grace_period_end)
  VALUES (NEW.id, NEW.email, NOW(), NULL)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  -- email 컬럼은 user_profiles에 있으나, 안전 차원에서 무조건 갱신
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 재확인
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5) 기존 사용자 user_usage 보장 (signup_date 설정)
-- 가입 시점 정보는 없으므로 user_profiles.created_at 사용
UPDATE user_usage
SET signup_date = (
  SELECT created_at FROM user_profiles WHERE user_profiles.id = user_usage.user_id
)
WHERE signup_date IS NULL;

-- 6) 기존 사용자 30일 유예: grace_period_end = NOW() + 30 days
UPDATE user_usage
SET grace_period_end = NOW() + INTERVAL '30 days'
WHERE grace_period_end IS NULL;
