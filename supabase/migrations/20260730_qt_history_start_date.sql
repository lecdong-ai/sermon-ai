-- qt_history 테이블에 start_date 컬럼 추가
-- 각 QT 생성 시 사용한 시작일(월요일)을 저장하여 월간 조립 시 날짜 정확히 매핑
ALTER TABLE qt_history ADD COLUMN IF NOT EXISTS start_date TEXT;
