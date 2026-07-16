-- qt_history 테이블: 사용자별 큐티 생성 기록 저장
CREATE TABLE IF NOT EXISTS qt_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bible_book TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  audience TEXT NOT NULL DEFAULT '일반 성도',
  level TEXT NOT NULL DEFAULT '중',
  tone TEXT NOT NULL DEFAULT '정중하고 따뜻한',
  series_name TEXT NOT NULL DEFAULT '말씀과 함께하는 큐티',
  size_option TEXT NOT NULL DEFAULT 'A5',
  design_template TEXT NOT NULL DEFAULT 'warm-modern',
  full_manuscript TEXT NOT NULL,
  day_data JSONB,
  start_passage TEXT,
  end_passage TEXT,
  subtitle TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE qt_history ENABLE ROW LEVEL SECURITY;

-- 각 사용자는 자신의 기록만 조회/수정/삭제 가능
DROP POLICY IF EXISTS "Users can view own qt_history" ON qt_history;
CREATE POLICY "Users can view own qt_history"
  ON qt_history FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own qt_history" ON qt_history;
CREATE POLICY "Users can insert own qt_history"
  ON qt_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own qt_history" ON qt_history;
CREATE POLICY "Users can update own qt_history"
  ON qt_history FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own qt_history" ON qt_history;
CREATE POLICY "Users can delete own qt_history"
  ON qt_history FOR DELETE
  USING (user_id = auth.uid());

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_qt_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_qt_history_updated_at ON qt_history;
CREATE TRIGGER trigger_qt_history_updated_at
  BEFORE UPDATE ON qt_history
  FOR EACH ROW
  EXECUTE FUNCTION update_qt_history_updated_at();
