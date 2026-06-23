-- =============================================
-- user_profiles 검색 인덱스 + email 컬럼 추가 (Phase 1)
-- =============================================
-- /admin/users 페이지의 이름/이메일 prefix 검색 성능 개선
-- text_pattern_ops: LIKE 'prefix%' 쿼리에 최적화
-- 1,000~5,000명 규모에서 풀스캔 방지
--
-- email 컬럼은 auth.users에서 반정규화 (Phase 2 계획의 일부를 미리 적용)
-- 향후 search/email 알림 등에 활용 가능

-- 1) email 컬럼 추가 (없을 경우에만)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2) 기존 사용자 email 채우기 (auth.users에서)
UPDATE user_profiles
SET email = (SELECT email FROM auth.users WHERE id = user_profiles.id);

-- 3) 검색 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_lower
  ON user_profiles (lower(email) text_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_user_profiles_name_lower
  ON user_profiles (lower(name) text_pattern_ops);

-- 4) 이메일 정확 일치 조회용 (선택적, 성능 추가)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email
  ON user_profiles (email);

-- 5) 회원가입 트리거 보강: 새 user_profiles 행에 email 자동 세팅
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거가 있으면 재정의 (없으면 생성)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6) 이메일 변경 시 user_profiles.email도 동기화
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_email();
