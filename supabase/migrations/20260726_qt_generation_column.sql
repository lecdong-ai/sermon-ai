-- qt_history: generation column for 4-generation QT support
ALTER TABLE qt_history ADD COLUMN IF NOT EXISTS generation TEXT;
CREATE INDEX IF NOT EXISTS idx_qt_history_generation ON qt_history(generation);
