-- =============================================
-- 설교 파생 콘텐츠 (sermon_derivatives) 테이블
-- =============================================
-- 설교 1편당 6가지 변환 콘텐츠 저장
-- (요약, 토론질문, 카드뉴스, 쇼츠, PPT, 가이드)

CREATE TABLE IF NOT EXISTS sermon_derivatives (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sermon_id   UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sermon_id, type),
  CONSTRAINT sermon_derivatives_type_check CHECK (type IN ('summary', 'questions', 'cardnews', 'shorts', 'ppt', 'guide'))
);

CREATE INDEX IF NOT EXISTS idx_sermon_derivatives_sermon ON sermon_derivatives(sermon_id);
CREATE INDEX IF NOT EXISTS idx_sermon_derivatives_user ON sermon_derivatives(user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_sermon_derivatives_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sermon_derivatives_updated_at ON sermon_derivatives;
CREATE TRIGGER trg_sermon_derivatives_updated_at
  BEFORE UPDATE ON sermon_derivatives
  FOR EACH ROW
  EXECUTE FUNCTION update_sermon_derivatives_updated_at();

-- ─── RLS ───
ALTER TABLE sermon_derivatives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sermon_derivatives_select" ON sermon_derivatives;
CREATE POLICY "sermon_derivatives_select" ON sermon_derivatives FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "sermon_derivatives_insert" ON sermon_derivatives;
CREATE POLICY "sermon_derivatives_insert" ON sermon_derivatives FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "sermon_derivatives_update" ON sermon_derivatives;
CREATE POLICY "sermon_derivatives_update" ON sermon_derivatives FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "sermon_derivatives_delete" ON sermon_derivatives;
CREATE POLICY "sermon_derivatives_delete" ON sermon_derivatives FOR DELETE
  USING (user_id = auth.uid());
