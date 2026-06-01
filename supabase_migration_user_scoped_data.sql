-- =============================================
-- 멀티유저 데이터 분리 — RLS 정책 + user_profiles
-- =============================================
-- 1. sermons 테이블에 RLS 적용 (user_id 기준 분리)
-- 2. user_profiles 테이블 생성

-- ─── 1. sermons 테이블 RLS ───
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sermons_select" ON sermons;
CREATE POLICY "sermons_select" ON sermons FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "sermons_insert" ON sermons;
CREATE POLICY "sermons_insert" ON sermons FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "sermons_update" ON sermons;
CREATE POLICY "sermons_update" ON sermons FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "sermons_delete" ON sermons;
CREATE POLICY "sermons_delete" ON sermons FOR DELETE
  USING (user_id = auth.uid());

-- ─── 2. user_profiles 테이블 ───
CREATE TABLE IF NOT EXISTS user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "user_profiles_insert" ON user_profiles;
CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;
CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ─── 3. user_profiles 자동 생성 트리거 ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 기존 사용자 프로필 생성
INSERT INTO public.user_profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;
