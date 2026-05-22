-- =============================================
-- 구독/사용량 관리 — DB 마이그레이션 v3 (수정)
-- =============================================
-- 기존 user_usage 테이블이 있을 경우 컬럼 추가
-- 신규 테이블은 CREATE TABLE IF NOT EXISTS

-- ─── 1. user_usage 테이블 확장 ───

-- 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS user_usage (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan              TEXT NOT NULL DEFAULT 'none',
  trial_used        INT NOT NULL DEFAULT 0,
  monthly_used      INT NOT NULL DEFAULT 0,
  last_reset_month  TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 기존 테이블에 새 컬럼 추가 (없을 때만)
ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS user_status       TEXT NOT NULL DEFAULT 'trial';
ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS trial_limit       INT NOT NULL DEFAULT 3;
ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS trial_start_at    TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS trial_end_at      TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '15 days';
ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS monthly_limit     INT NOT NULL DEFAULT 0;
ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS subscription_id   UUID;

-- 기존 데이터 업데이트 (plan이 'free'나 'trial'이면 'none'으로 통일)
UPDATE user_usage SET plan = 'none' WHERE plan IN ('free', 'trial');
UPDATE user_usage SET plan = 'basic' WHERE plan NOT IN ('none', 'basic', 'pro', '');
UPDATE user_usage SET user_status = 'trial' WHERE user_status = 'trial' OR user_status IS NULL;
UPDATE user_usage SET trial_end_at = created_at + INTERVAL '15 days' WHERE trial_end_at IS NULL OR trial_end_at = created_at;

-- CHECK 제약조건 추가 (기존 데이터와 충돌 시 제약조건 추가 불가 → 안전하게 DO 블록 사용)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_usage_plan_check') THEN
    EXECUTE 'ALTER TABLE user_usage ADD CONSTRAINT user_usage_plan_check CHECK (plan IN (''none'', ''basic'', ''pro''))';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_usage_status_check') THEN
    EXECUTE 'ALTER TABLE user_usage ADD CONSTRAINT user_usage_status_check CHECK (user_status IN (''trial'', ''trial_expired'', ''active'', ''past_due'', ''canceled''))';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_plan ON user_usage(plan);
CREATE INDEX IF NOT EXISTS idx_user_usage_status ON user_usage(user_status);

ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_usage_select" ON user_usage;
CREATE POLICY "user_usage_select" ON user_usage FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_usage_insert" ON user_usage;
CREATE POLICY "user_usage_insert" ON user_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_usage_update" ON user_usage;
CREATE POLICY "user_usage_update" ON user_usage FOR UPDATE
  USING (user_id = auth.uid());

-- ─── 2. generation_jobs (idempotency) ───
CREATE TABLE IF NOT EXISTS generation_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sermon_id       UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  item            TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'pending',
  result          JSONB,
  error           TEXT,
  deduction_log   UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  CONSTRAINT generation_jobs_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_user ON generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_sermon ON generation_jobs(sermon_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_idempotency ON generation_jobs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON generation_jobs(status);

ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "generation_jobs_select" ON generation_jobs;
CREATE POLICY "generation_jobs_select" ON generation_jobs FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "generation_jobs_insert" ON generation_jobs;
CREATE POLICY "generation_jobs_insert" ON generation_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "generation_jobs_update" ON generation_jobs;
CREATE POLICY "generation_jobs_update" ON generation_jobs FOR UPDATE
  USING (user_id = auth.uid());

-- ─── 3. usage_logs (감사 추적) ───
CREATE TABLE IF NOT EXISTS usage_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID,
  usage_type      TEXT NOT NULL,
  sermon_id       UUID REFERENCES sermons(id) ON DELETE SET NULL,
  item            TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  deducted        BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT usage_logs_type_check CHECK (usage_type IN ('trial', 'monthly'))
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_idempotency ON usage_logs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at DESC);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usage_logs_select" ON usage_logs;
CREATE POLICY "usage_logs_select" ON usage_logs FOR SELECT
  USING (user_id = auth.uid());

-- ─── 4. subscriptions ───
CREATE TABLE IF NOT EXISTS subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'active',
  billing_cycle_start TIMESTAMPTZ NOT NULL,
  billing_cycle_end   TIMESTAMPTZ NOT NULL,
  monthly_limit       INT NOT NULL,
  monthly_used        INT NOT NULL DEFAULT 0,
  payment_provider    TEXT,
  payment_method_id   TEXT,
  canceled_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_plan_check CHECK (plan IN ('basic', 'pro')),
  CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'past_due', 'canceled', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select" ON subscriptions;
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "subscriptions_insert" ON subscriptions;
CREATE POLICY "subscriptions_insert" ON subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "subscriptions_update" ON subscriptions;
CREATE POLICY "subscriptions_update" ON subscriptions FOR UPDATE
  USING (user_id = auth.uid());

-- ─── 5. payment_history ───
CREATE TABLE IF NOT EXISTS payment_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount          INT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'KRW',
  status          TEXT NOT NULL,
  payment_method  TEXT,
  provider_tx_id  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_history_status_check CHECK (status IN ('succeeded', 'failed', 'refunded'))
);

CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);

ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_history_select" ON payment_history;
CREATE POLICY "payment_history_select" ON payment_history FOR SELECT
  USING (user_id = auth.uid());
