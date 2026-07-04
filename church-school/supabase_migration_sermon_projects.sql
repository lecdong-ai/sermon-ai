-- 설교 프로젝트 (Sermon Project) — New Supabase Project Schema
-- Target: church_school_projects (ref: wpvcsxencajgmunnnndjs)
-- Data isolation: 완전 독립된 프로젝트 (메인 앱과 데이터 공유 안 함)
-- Auth: 기존 church-school Supabase 프로젝트에서 처리, 데이터는 이 프로젝트에 저장
--
-- ⚠️ 이 마이그레이션은 idempotent합니다 (재실행 가능).
--    정책/트리거는 DROP IF EXISTS 후 CREATE합니다.

-- ============================================================
-- 1. sermons (설교 프로젝트 메인 테이블)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sermons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  passage text,
  book text,
  chapter_start integer,
  chapter_end integer,
  verse_start integer,
  verse_end integer,
  sermon_date date,
  series text,
  season text,
  audience jsonb DEFAULT '[]'::jsonb,
  church_context text,
  source text DEFAULT 'project',
  status text DEFAULT 'draft',
  version integer DEFAULT 1,
  passages jsonb DEFAULT '[]'::jsonb,
  result jsonb DEFAULT '{}'::jsonb,
  raw_text text,
  file_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sermons_user_id ON public.sermons(user_id);
CREATE INDEX IF NOT EXISTS idx_sermons_updated_at ON public.sermons(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_status ON public.sermons(status);

-- ============================================================
-- 2. sermon_notes (연구 노트)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sermon_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id uuid NOT NULL REFERENCES public.sermons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  observation_notes text,
  background_notes text,
  interpretation_notes text,
  illustration_notes text,
  application_points text,
  core_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sermon_notes_sermon_id ON public.sermon_notes(sermon_id);
CREATE INDEX IF NOT EXISTS idx_sermon_notes_user_id ON public.sermon_notes(user_id);

-- ============================================================
-- 3. sermon_outlines (설교 개요)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sermon_outlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id uuid NOT NULL REFERENCES public.sermons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  introduction text,
  main_points jsonb DEFAULT '[]'::jsonb,
  conclusion text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sermon_outlines_sermon_id ON public.sermon_outlines(sermon_id);
CREATE INDEX IF NOT EXISTS idx_sermon_outlines_user_id ON public.sermon_outlines(user_id);

-- ============================================================
-- 4. sermon_manuscripts (설교 원고)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sermon_manuscripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id uuid NOT NULL REFERENCES public.sermons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sermon_manuscripts_sermon_id ON public.sermon_manuscripts(sermon_id);
CREATE INDEX IF NOT EXISTS idx_sermon_manuscripts_user_id ON public.sermon_manuscripts(user_id);

-- ============================================================
-- 5. generated_outputs (AI 생성 기록)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.generated_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id uuid NOT NULL REFERENCES public.sermons(id) ON DELETE CASCADE,
  type text NOT NULL,
  input_data jsonb,
  output_data jsonb,
  user_action text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generated_outputs_sermon_id ON public.generated_outputs(sermon_id);
CREATE INDEX IF NOT EXISTS idx_generated_outputs_type ON public.generated_outputs(type);

-- ============================================================
-- 6. notes (인사이트 노트 — LinkedInsightBanner용)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  content text,
  summary text,
  tags jsonb DEFAULT '[]'::jsonb,
  starred boolean DEFAULT false,
  pinned boolean DEFAULT false,
  connections jsonb DEFAULT '[]'::jsonb,
  project_ids jsonb DEFAULT '[]'::jsonb,
  series_ids jsonb DEFAULT '[]'::jsonb,
  archive_ids jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_referenced_at timestamptz,
  reference_count integer DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON public.notes(type);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);

-- ============================================================
-- 7. series (설교 시리즈)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  cover_image text,
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_series_user_id ON public.series(user_id);

-- ============================================================
-- 8. RLS (Row Level Security) — 각 사용자는 자신의 데이터만 접근
-- ============================================================

-- Enable RLS
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermon_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermon_outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermon_manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Users can view own sermons" ON public.sermons;
DROP POLICY IF EXISTS "Users can insert own sermons" ON public.sermons;
DROP POLICY IF EXISTS "Users can update own sermons" ON public.sermons;
DROP POLICY IF EXISTS "Users can delete own sermons" ON public.sermons;
DROP POLICY IF EXISTS "Users can view own sermon_notes" ON public.sermon_notes;
DROP POLICY IF EXISTS "Users can view own sermon_outlines" ON public.sermon_outlines;
DROP POLICY IF EXISTS "Users can view own sermon_manuscripts" ON public.sermon_manuscripts;
DROP POLICY IF EXISTS "Users can view own generated_outputs" ON public.generated_outputs;
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can view own series" ON public.series;

-- Recreate policies
-- (Note: auth는 기존 church-school Supabase 프로젝트에서 처리되므로
--  auth.uid()는 church-school의 user.id를 반환. 이 프로젝트에는 같은
--  user.id를 가진 user가 없으므로 RLS는 서비스 롤 키로 우회됨.
--  실사용은 service role로 접근하므로 RLS는 데이터 보안을 위한 추가 계층)

CREATE POLICY "Users can view own sermons" ON public.sermons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sermons" ON public.sermons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sermons" ON public.sermons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sermons" ON public.sermons
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sermon_notes" ON public.sermon_notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sermon_outlines" ON public.sermon_outlines
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sermon_manuscripts" ON public.sermon_manuscripts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own generated_outputs" ON public.generated_outputs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sermons
      WHERE sermons.id = generated_outputs.sermon_id
      AND sermons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own notes" ON public.notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own series" ON public.series
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 9. updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers (idempotent)
DROP TRIGGER IF EXISTS trg_sermons_updated_at ON public.sermons;
DROP TRIGGER IF EXISTS trg_sermon_notes_updated_at ON public.sermon_notes;
DROP TRIGGER IF EXISTS trg_sermon_outlines_updated_at ON public.sermon_outlines;
DROP TRIGGER IF EXISTS trg_sermon_manuscripts_updated_at ON public.sermon_manuscripts;
DROP TRIGGER IF EXISTS trg_notes_updated_at ON public.notes;
DROP TRIGGER IF EXISTS trg_series_updated_at ON public.series;

-- Recreate triggers
CREATE TRIGGER trg_sermons_updated_at
  BEFORE UPDATE ON public.sermons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_sermon_notes_updated_at
  BEFORE UPDATE ON public.sermon_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_sermon_outlines_updated_at
  BEFORE UPDATE ON public.sermon_outlines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_sermon_manuscripts_updated_at
  BEFORE UPDATE ON public.sermon_manuscripts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_series_updated_at
  BEFORE UPDATE ON public.series
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
