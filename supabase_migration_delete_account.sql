-- =============================================
-- 회원탈퇴 — deleted_users 테이블 + 계정 삭제
-- =============================================

-- ─── 1. deleted_users 테이블 ───
CREATE TABLE IF NOT EXISTS deleted_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  deleted_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE deleted_users ENABLE ROW LEVEL SECURITY;

-- admin만 조회 가능
DROP POLICY IF EXISTS "deleted_users_admin_select" ON deleted_users;
CREATE POLICY "deleted_users_admin_select" ON deleted_users FOR SELECT
  USING (false);

-- ─── 2. 계정 삭제 함수 (서버에서만 호출) ───
CREATE OR REPLACE FUNCTION public.delete_user_account(user_uuid UUID)
RETURNS void AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- 이메일 조회
  SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;

  -- deleted_users에 기록
  IF user_email IS NOT NULL THEN
    INSERT INTO public.deleted_users (email)
    VALUES (user_email)
    ON CONFLICT (email) DO NOTHING;
  END IF;

  -- 사용자 데이터 삭제 (RLS에 의해 user_id 기준 자동 분리)
  DELETE FROM public.sermons WHERE user_id = user_uuid;
  DELETE FROM public.user_profiles WHERE id = user_uuid;
  DELETE FROM public.user_usage WHERE user_id = user_uuid;
  DELETE FROM public.study_guides WHERE user_id = user_uuid;
  DELETE FROM public.generation_jobs WHERE user_id = (SELECT id FROM public.sermons WHERE user_id = user_uuid LIMIT 1);
  DELETE FROM public.usage_logs WHERE user_id = user_uuid;
  DELETE FROM public.subscriptions WHERE user_id = user_uuid;

  -- auth 계정 삭제
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
