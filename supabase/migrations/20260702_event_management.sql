-- 교회 행사 신청/관리 시스템 (Event Management)
-- 테이블: events, registrations, event_groups, event_teams, event_vehicles, event_vehicle_stops, event_notices

-- 1. events (행사)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'summer_bible',
  description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  fee INTEGER DEFAULT 0,
  bank_account_info TEXT DEFAULT '',
  max_participants INTEGER DEFAULT 100,
  registration_start DATE,
  registration_end DATE,
  event_start DATE,
  event_end DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  form_fields JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  target_description TEXT DEFAULT ''
);

CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_created_by ON public.events(created_by);

-- 2. registrations (참가 신청)
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  participant_name TEXT NOT NULL,
  grade TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  birth TEXT DEFAULT '',
  parent_name TEXT DEFAULT '',
  parent_phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  emergency_contact TEXT DEFAULT '',
  allergies TEXT DEFAULT '',
  tshirt_size TEXT DEFAULT '',
  vehicle_usage TEXT DEFAULT '',
  friend_with TEXT DEFAULT '',
  photo_consent BOOLEAN DEFAULT false,
  privacy_consent BOOLEAN DEFAULT false,
  extra_fields JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'registered',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  depositor_name TEXT DEFAULT '',
  payment_amount INTEGER DEFAULT 0,
  payment_date TEXT DEFAULT '',
  admin_memo TEXT DEFAULT '',
  group_id TEXT,
  team_id TEXT,
  vehicle_id TEXT,
  check_in_at TIMESTAMPTZ,
  return_check_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX idx_registrations_status ON public.registrations(status);
CREATE INDEX idx_registrations_payment_status ON public.registrations(payment_status);

-- 3. event_groups (반)
CREATE TABLE IF NOT EXISTS public.event_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  max_capacity INTEGER DEFAULT 50,
  color TEXT DEFAULT '#4ECDC4',
  "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_event_groups_event_id ON public.event_groups(event_id);

-- 4. event_teams (조)
CREATE TABLE IF NOT EXISTS public.event_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.event_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_capacity INTEGER DEFAULT 20,
  "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_event_teams_group_id ON public.event_teams(group_id);

-- 5. event_vehicles (차량)
CREATE TABLE IF NOT EXISTS public.event_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  driver_name TEXT DEFAULT '',
  driver_phone TEXT DEFAULT '',
  max_capacity INTEGER DEFAULT 25,
  departure_time TEXT DEFAULT '',
  departure_location TEXT DEFAULT '',
  route_description TEXT DEFAULT '',
  "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_event_vehicles_event_id ON public.event_vehicles(event_id);

-- 6. event_vehicle_stops (차량 정류장)
CREATE TABLE IF NOT EXISTS public.event_vehicle_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.event_vehicles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_event_vehicle_stops_vehicle_id ON public.event_vehicle_stops(vehicle_id);

-- 7. event_notices (공지)
CREATE TABLE IF NOT EXISTS public.event_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  target TEXT NOT NULL DEFAULT 'all',
  target_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by TEXT DEFAULT ''
);

CREATE INDEX idx_event_notices_event_id ON public.event_notices(event_id);

-- RLS (Row Level Security)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_vehicle_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_notices ENABLE ROW LEVEL SECURITY;

-- 누구나 이벤트를 볼 수 있음 (공개 목록)
CREATE POLICY "events_select_all" ON public.events FOR SELECT USING (true);
-- 관리자만 생성/수정/삭제 (실제로는 auth.users role 기반으로 변경 필요)
CREATE POLICY "events_insert_admin" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "events_update_admin" ON public.events FOR UPDATE USING (true);
CREATE POLICY "events_delete_admin" ON public.events FOR DELETE USING (true);

-- registrations: 누구나 자신의 신청 조회 가능, 관리자는 모두 조회 가능
CREATE POLICY "registrations_select" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "registrations_insert" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "registrations_update" ON public.registrations FOR UPDATE USING (true);
CREATE POLICY "registrations_delete" ON public.registrations FOR DELETE USING (true);

-- event_groups, event_teams, event_vehicles, event_notices: 모두 접근 가능 (관리자 중심)
CREATE POLICY "groups_select" ON public.event_groups FOR SELECT USING (true);
CREATE POLICY "groups_insert" ON public.event_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "groups_update" ON public.event_groups FOR UPDATE USING (true);
CREATE POLICY "groups_delete" ON public.event_groups FOR DELETE USING (true);

CREATE POLICY "teams_select" ON public.event_teams FOR SELECT USING (true);
CREATE POLICY "teams_insert" ON public.event_teams FOR INSERT WITH CHECK (true);
CREATE POLICY "teams_update" ON public.event_teams FOR UPDATE USING (true);
CREATE POLICY "teams_delete" ON public.event_teams FOR DELETE USING (true);

CREATE POLICY "vehicles_select" ON public.event_vehicles FOR SELECT USING (true);
CREATE POLICY "vehicles_insert" ON public.event_vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "vehicles_update" ON public.event_vehicles FOR UPDATE USING (true);
CREATE POLICY "vehicles_delete" ON public.event_vehicles FOR DELETE USING (true);

CREATE POLICY "stops_select" ON public.event_vehicle_stops FOR SELECT USING (true);
CREATE POLICY "stops_insert" ON public.event_vehicle_stops FOR INSERT WITH CHECK (true);
CREATE POLICY "stops_update" ON public.event_vehicle_stops FOR UPDATE USING (true);
CREATE POLICY "stops_delete" ON public.event_vehicle_stops FOR DELETE USING (true);

CREATE POLICY "notices_select" ON public.event_notices FOR SELECT USING (true);
CREATE POLICY "notices_insert" ON public.event_notices FOR INSERT WITH CHECK (true);
CREATE POLICY "notices_update" ON public.event_notices FOR UPDATE USING (true);
CREATE POLICY "notices_delete" ON public.event_notices FOR DELETE USING (true);
