-- =============================================
-- B5: 다중 본문 (Multi-Passage) 지원
-- =============================================
-- sermons 테이블에 passages JSONB 컬럼 추가
-- 기존 단일 passage/book/chapter/verse 컬럼은 그대로 유지 (backward compatibility)
-- 새 필드는 passages 컬럼에 JSON 배열로 저장
--
-- passages 형식:
-- [
--   {
--     "id": "uuid",
--     "book": "요한복음",
--     "chapterStart": 3,
--     "verseStart": 16,
--     "verseEnd": 18,
--     "label": "요한복음 3:16-18",
--     "role": "primary"  // primary | parallel | supporting
--   }
-- ]

-- 1. passages 컬럼 추가
ALTER TABLE sermons
  ADD COLUMN IF NOT EXISTS passages JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. GIN 인덱스 추가 (빠른 검색용)
CREATE INDEX IF NOT EXISTS idx_sermons_passages
  ON sermons USING GIN (passages);

-- 3. 기존 데이터를 passages 컬럼으로 마이그레이션
-- 단일 passage/book/chapter가 있는 경우 첫 번째 본문으로 추가
UPDATE sermons
SET passages = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid(),
    'book', COALESCE(book, ''),
    'chapterStart', COALESCE(chapter_start, 1),
    'chapterEnd', COALESCE(chapter_end, chapter_start, 1),
    'verseStart', COALESCE(verse_start, 1),
    'verseEnd', COALESCE(verse_end, verse_start, 1),
    'label', COALESCE(passage, ''),
    'role', 'primary'
  )
)
WHERE
  -- 이미 마이그레이션 안 된 것만
  (passages = '[]'::jsonb OR passages IS NULL)
  AND (
    passage IS NOT NULL AND passage != ''
    OR book IS NOT NULL AND book != ''
  );

-- 4. 검증: 마이그레이션 결과 확인용 (선택)
-- SELECT id, passage, book, jsonb_array_length(passages) AS passage_count
-- FROM sermons
-- WHERE user_id = '00000000-0000-0000-0000-000000000001'
-- ORDER BY updated_at DESC LIMIT 5;
