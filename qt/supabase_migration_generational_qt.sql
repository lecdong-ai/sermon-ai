-- 세대별 큐티 자료실
CREATE TABLE IF NOT EXISTS generational_qt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation TEXT NOT NULL CHECK (generation IN ('초등','중고등','청년','장년')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  bible_passage TEXT DEFAULT '',
  week_label TEXT DEFAULT '',
  files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE generational_qt ENABLE ROW LEVEL SECURITY;

-- anon: 읽기만 가능
CREATE POLICY "anon_select" ON generational_qt
  FOR SELECT USING (true);

-- service_role: 모든 권한 (관리자 API에서 사용)
CREATE POLICY "service_all" ON generational_qt
  FOR ALL USING (auth.role() = 'service_role');

-- updated_at 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_generational_qt_updated_at ON generational_qt;
CREATE TRIGGER update_generational_qt_updated_at
  BEFORE UPDATE ON generational_qt
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_generational_qt_generation ON generational_qt(generation);
CREATE INDEX IF NOT EXISTS idx_generational_qt_created_at ON generational_qt(created_at DESC);
