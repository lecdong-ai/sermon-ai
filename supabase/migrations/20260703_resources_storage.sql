-- resources 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT,
  category TEXT,
  description TEXT,
  content TEXT,
  preview_text TEXT,
  tags TEXT[] DEFAULT '{}',
  is_free BOOLEAN DEFAULT true,
  price INTEGER DEFAULT 0,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'published',
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 학교 자료실 파일 업로드를 위한 Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'school_resources',
  'school_resources',
  true,
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.hancom.hwp', 'application/vnd.hancom.hwpx', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/markdown', 'text/plain', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/zip', 'application/x-zip-compressed']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: 누구나 school_resources 버킷의 파일을 읽을 수 있음 (public bucket)
CREATE POLICY "Anyone can view school_resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'school_resources');

-- RLS: 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload to school_resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'school_resources'
  AND auth.role() = 'authenticated'
);

-- RLS: 본인 파일만 삭제 가능 (owner 필드는 auth.uid()로 자동 설정)
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'school_resources'
  AND auth.uid() = owner
);

-- resources 테이블에 파일 관련 컬럼 추가
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_size BIGINT;
