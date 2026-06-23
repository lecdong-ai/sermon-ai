-- =============================================
-- user_profiles 검색 인덱스 (Phase 1)
-- =============================================
-- /admin/users 페이지의 이름/이메일 prefix 검색 성능 개선
-- text_pattern_ops: LIKE 'prefix%' 쿼리에 최적화
-- 1,000~5,000명 규모에서 풀스캔 방지

CREATE INDEX IF NOT EXISTS idx_user_profiles_email_lower
  ON user_profiles (lower(email) text_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_user_profiles_name_lower
  ON user_profiles (lower(name) text_pattern_ops);

-- 후원 회원 필터링 가속
CREATE INDEX IF NOT EXISTS idx_user_profiles_supporter_until
  ON user_profiles (supporter_until)
  WHERE supporter_until IS NOT NULL;
