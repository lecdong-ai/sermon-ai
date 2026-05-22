-- study_guides 테이블 생성
CREATE TABLE IF NOT EXISTS study_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_guides_user_id ON study_guides(user_id);
CREATE INDEX IF NOT EXISTS idx_study_guides_created_at ON study_guides(created_at DESC);

-- RLS
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study guides"
  ON study_guides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study guides"
  ON study_guides FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study guides"
  ON study_guides FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study guides"
  ON study_guides FOR DELETE
  USING (auth.uid() = user_id);
