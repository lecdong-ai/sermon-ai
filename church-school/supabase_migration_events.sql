-- ============================================
-- 교회 행사 신청 시스템 (Church Event Application System)
-- ============================================

-- Events 테이블
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'cancelled')),
  link_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  custom_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_template BOOLEAN NOT NULL DEFAULT false,
  cloned_from UUID REFERENCES events(id) ON DELETE SET NULL,
  contact_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Applications 테이블
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  department TEXT,
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  emergency_phone TEXT,
  health_notes TEXT,
  allergies TEXT,
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  privacy_consented_at TIMESTAMPTZ,
  privacy_consent_text TEXT,
  photo_consent BOOLEAN NOT NULL DEFAULT false,
  photo_consent_text TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'waiting_deposit', 'deposited', 'cancelled')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'confirmed', 'waiting_deposit', 'deposited', 'cancelled')),
  custom_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  check_in_at TIMESTAMPTZ,
  check_in_status TEXT NOT NULL DEFAULT 'not_checked_in' CHECK (check_in_status IN ('not_checked_in', 'checked_in')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, student_name, birth_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_link_token ON events(link_token);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_applications_event_id ON applications(event_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_parent_phone ON applications(parent_phone);
CREATE INDEX IF NOT EXISTS idx_applications_check_in ON applications(event_id, check_in_status);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_events_updated_at ON events;
CREATE TRIGGER trigger_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_applications_updated_at ON applications;
CREATE TRIGGER trigger_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Events: users can CRUD their own events
CREATE POLICY "events_select_own" ON events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "events_insert_own" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_update_own" ON events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "events_delete_own" ON events FOR DELETE USING (auth.uid() = user_id);

-- Applications: only event owner can view/manage
CREATE POLICY "applications_select_owner" ON applications FOR SELECT
  USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "applications_update_owner" ON applications FOR UPDATE
  USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "applications_delete_owner" ON applications FOR DELETE
  USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
-- NOTE: INSERT is done via service_role (supabaseAdmin) in API routes, bypassing RLS
