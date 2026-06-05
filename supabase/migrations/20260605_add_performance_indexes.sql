-- Performance optimization: Add indexes for frequently queried columns
-- Created: 2026-06-05

-- Index for sermon list queries (filter by user, order by updated_at)
CREATE INDEX IF NOT EXISTS idx_sermons_user_updated ON sermons(user_id, updated_at DESC);

-- Index for user usage lookups
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);

-- Index for generation job idempotency checks
CREATE INDEX IF NOT EXISTS idx_generation_jobs_idempotency ON generation_jobs(idempotency_key);

-- Index for series-based queries
CREATE INDEX IF NOT EXISTS idx_sermons_series ON sermons((result->>'seriesId')) WHERE result->>'seriesId' IS NOT NULL;
