-- =============================================
-- 방문자 추적 (Visitor Tracking) — Bunker 목양
-- =============================================
-- visitor_logs: 모든 페이지 방문 기록
-- path: 방문 경로 (e.g. "/advanced/projects/123")
-- user_id: 로그인 시 Supabase auth.users.id, 비로그인은 null
-- device: 'mobile' | 'desktop' | 'tablet'
-- session_id: 클라이언트 세션 UUID (하루 단위로 갱신)
-- created_at: 방문 시각 (UTC)

CREATE TABLE IF NOT EXISTS visitor_logs (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device TEXT NOT NULL CHECK (device IN ('mobile', 'desktop', 'tablet')),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 최근 7일 + 24시간 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_visitor_logs_created_at ON visitor_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_session ON visitor_logs (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_path ON visitor_logs (path, created_at DESC);

-- 90일 지난 레코드 자동 삭제 (월 1회 cron 권장)
-- SELECT cron.schedule('cleanup-visitor-logs', '0 0 1 * *', $$DELETE FROM visitor_logs WHERE created_at < NOW() - INTERVAL '90 days'$$);

-- RLS: 누구나 INSERT 가능, 조회는 admin만
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- INSERT 정책: 누구나 (anon + authenticated) 기록 가능
DROP POLICY IF EXISTS "visitor_logs_insert_all" ON visitor_logs;
CREATE POLICY "visitor_logs_insert_all" ON visitor_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SELECT 정책: admin만 조회 가능
DROP POLICY IF EXISTS "visitor_logs_select_admin" ON visitor_logs;
CREATE POLICY "visitor_logs_select_admin" ON visitor_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 검증용 쿼리
-- SELECT
--   DATE_TRUNC('hour', created_at) AS hour,
--   COUNT(*) AS visits
-- FROM visitor_logs
-- WHERE created_at > NOW() - INTERVAL '24 hours'
-- GROUP BY hour
-- ORDER BY hour;
