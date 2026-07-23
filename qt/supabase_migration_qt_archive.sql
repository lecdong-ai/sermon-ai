CREATE TABLE IF NOT EXISTS qt_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  bible_passage TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  season TEXT DEFAULT '연중',
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE qt_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select" ON qt_archive
  FOR SELECT USING (true);

CREATE POLICY "service_all" ON qt_archive
  FOR ALL USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_qt_archive_updated_at ON qt_archive;
CREATE TRIGGER update_qt_archive_updated_at
  BEFORE UPDATE ON qt_archive
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_qt_archive_published_at ON qt_archive(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_qt_archive_season ON qt_archive(season);
