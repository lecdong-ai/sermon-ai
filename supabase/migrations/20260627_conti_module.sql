-- =====================================================
-- 예배 콘티 (Conti) 모듈
-- =====================================================
-- 시스템 곡 + 사용자 콘티 + 곡 배치 + 예배 일정 관리

-- 1. 곡 라이브러리 (시스템 + 사용자)
CREATE TABLE IF NOT EXISTS conti_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = 시스템 곡
  title TEXT NOT NULL,
  artist TEXT,
  original_key TEXT,                        -- 'C', 'G', 'Am' 등
  bpm INTEGER,
  duration_sec INTEGER,
  lyrics TEXT,
  chords TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'CCM',              -- 'CCM' | '워십' | '찬송가' | '기타'
  source TEXT DEFAULT 'manual',             -- 'system'|'manual'|'image'|'url'|'pdf'|'voice'
  youtube_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conti_songs_user_id ON conti_songs(user_id);
CREATE INDEX IF NOT EXISTS idx_conti_songs_title ON conti_songs USING gin(to_tsvector('simple', title));
CREATE INDEX IF NOT EXISTS idx_conti_songs_tags ON conti_songs USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_conti_songs_category ON conti_songs(category);

-- 2. 콘티 (예배 세트)
CREATE TABLE IF NOT EXISTS conti_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE,
  worship_type TEXT DEFAULT 'sunday_am',    -- 'sunday_am'|'sunday_pm'|'wednesday'|'dawn'|'special'
  memo TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,                  -- 공유 링크용 토큰
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conti_sets_user_id ON conti_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_conti_sets_date ON conti_sets(date DESC);
CREATE INDEX IF NOT EXISTS idx_conti_sets_share_token ON conti_sets(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conti_sets_public ON conti_sets(is_public) WHERE is_public = TRUE;

-- 3. 콘티 항목 (곡 배치)
CREATE TABLE IF NOT EXISTS conti_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conti_id UUID NOT NULL REFERENCES conti_sets(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES conti_songs(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL,
  key TEXT,                                  -- 콘티에서의 key (null = 원곡)
  bpm_override INTEGER,
  transition_memo TEXT DEFAULT '',
  memo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conti_id, position)
);

CREATE INDEX IF NOT EXISTS idx_conti_items_conti_id ON conti_items(conti_id, position);
CREATE INDEX IF NOT EXISTS idx_conti_items_song_id ON conti_items(song_id);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- conti_songs: 시스템 곡(user_id IS NULL)은 모두 읽기 가능, 사용자는 본인 곡만 CRUD
ALTER TABLE conti_songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conti_songs_select" ON conti_songs;
CREATE POLICY "conti_songs_select" ON conti_songs FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "conti_songs_insert" ON conti_songs;
CREATE POLICY "conti_songs_insert" ON conti_songs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "conti_songs_update" ON conti_songs;
CREATE POLICY "conti_songs_update" ON conti_songs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "conti_songs_delete" ON conti_songs;
CREATE POLICY "conti_songs_delete" ON conti_songs FOR DELETE
  USING (user_id = auth.uid());

-- conti_sets: 본인 것만 CRUD, 공개된 것은 모두 읽기 가능
ALTER TABLE conti_sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conti_sets_select" ON conti_sets;
CREATE POLICY "conti_sets_select" ON conti_sets FOR SELECT
  USING (user_id = auth.uid() OR is_public = TRUE);

DROP POLICY IF EXISTS "conti_sets_insert" ON conti_sets;
CREATE POLICY "conti_sets_insert" ON conti_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "conti_sets_update" ON conti_sets;
CREATE POLICY "conti_sets_update" ON conti_sets FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "conti_sets_delete" ON conti_sets;
CREATE POLICY "conti_sets_delete" ON conti_sets FOR DELETE
  USING (user_id = auth.uid());

-- conti_items: 부모 conti 의 RLS 를 따름
ALTER TABLE conti_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conti_items_select" ON conti_items;
CREATE POLICY "conti_items_select" ON conti_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conti_sets
      WHERE conti_sets.id = conti_items.conti_id
        AND (conti_sets.user_id = auth.uid() OR conti_sets.is_public = TRUE)
    )
  );

DROP POLICY IF EXISTS "conti_items_modify" ON conti_items;
CREATE POLICY "conti_items_modify" ON conti_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM conti_sets
      WHERE conti_sets.id = conti_items.conti_id
        AND conti_sets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conti_sets
      WHERE conti_sets.id = conti_items.conti_id
        AND conti_sets.user_id = auth.uid()
    )
  );

-- =====================================================
-- 트리거: updated_at 자동 갱신
-- =====================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_conti_songs_updated_at ON conti_songs;
CREATE TRIGGER trg_conti_songs_updated_at
  BEFORE UPDATE ON conti_songs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_conti_sets_updated_at ON conti_sets;
CREATE TRIGGER trg_conti_sets_updated_at
  BEFORE UPDATE ON conti_sets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_conti_items_updated_at ON conti_items;
CREATE TRIGGER trg_conti_items_updated_at
  BEFORE UPDATE ON conti_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- 시드 데이터: 시스템 곡 12개 + 샘플 콘티 4개
-- =====================================================

-- 시스템 곡 (id 명시)
INSERT INTO conti_songs (id, user_id, title, artist, original_key, bpm, duration_sec, lyrics, chords, tags, category, source) VALUES
  ('00000000-0000-0000-0000-000000000001', NULL, '주님의 은혜', '뉴젠 워십', 'C', 76, 240, '주님의 은혜가 나를 감싸네
그 사랑 영원하리

주의 손이 나를 인도하시니
두려움 없네', 'C - G/B - Am - F
C - G - F - C

F - G - Em - Am
Dm7 - G - C', ARRAY['은혜','경배'], 'CCM', 'system'),
  ('00000000-0000-0000-0000-000000000002', NULL, '내 영혼의 그늘진 골짜기에', '마커스 워십', 'D', 68, 280, '내 영혼의 그늘진 골짜기에
주의 발자국 따라가리

주의 품이 안전하네
나의 피난처 되시네', 'D - A/C# - Bm - G
D - A - G - D

G - D - A - Bm
G - A - D', ARRAY['은혜','위로','경배'], '워십', 'system'),
  ('00000000-0000-0000-0000-000000000003', NULL, '예수 나의 첫사랑 되시네', '어노인팅', 'G', 84, 260, '예수 나의 첫사랑 되시네
어떤 것도 대신할 수 없네

주님만이 내 맘에 가득해
영원토록 변하지 않네', 'G - D/F# - Em - C
G - D - C - G

C - G - D - Em
C - D - G', ARRAY['사랑','찬양','경배'], 'CCM', 'system'),
  ('00000000-0000-0000-0000-000000000004', NULL, '십자가의 길', 'T.새뮤얼', 'Eb', 72, 320, '십자가의 길 걸어가네
주님 따르는 이 길

고개 숙여 경배하네
그 은혜 감사해', 'Eb - Ab - Bb7 - Eb
Eb/G - Ab - Bb - Eb

Ab - Eb - Fm7 - Bb7
Eb - Cm - Ab - Bb7 - Eb', ARRAY['은혜','경배','말씀'], '워십', 'system'),
  ('00000000-0000-0000-0000-000000000005', NULL, '주의 사랑', '현대찬양', 'F', 84, 270, '주의 사랑 나를 감싸네
그 크신 은혜 놀라워

나 주님만 따라가리
영원히 함께 하리', 'F - Bb - C - F
Dm - Am - Bb - C

F - Dm - Bb - C
Bb - C - F', ARRAY['사랑','은혜','찬양'], 'CCM', 'system'),
  ('00000000-0000-0000-0000-000000000006', NULL, '주의 음성을 내가 들으니', '마커스 워십', 'Bb', 80, 290, '주의 음성을 내가 들으니
어디로 가는지 알려주소서

주의 발자국 따라가며
주님과 동행하리라', 'Bb - F/A - Gm - Eb
Bb - F - Eb - Bb

Eb - Bb - F - Gm
Eb - F - Bb', ARRAY['말씀','은혜','경배'], '워십', 'system'),
  ('00000000-0000-0000-0000-000000000007', NULL, '할렐루야 우리 예수', '어노인팅', 'A', 120, 220, '할렐루야 우리 예수
할렐루야 우리 왕

다 함께 높이 든다
주의 이름을 찬양해', 'A - E/G# - F#m - D
A - E - D - A

D - A - E - F#m
D - E - A', ARRAY['찬양','축제'], 'CCM', 'system'),
  ('00000000-0000-0000-0000-000000000008', NULL, '나 같은 죄인 살리신', '찬송가 279장', 'G', 80, 200, '나 같은 죄인 살리신
주 은혜 감사해

십자가 피로 씻어주신
주 은혜 감사해', 'G - C - G - D
G - C - G - D - G', ARRAY['회개','고백','은혜'], '찬송가', 'system'),
  ('00000000-0000-0000-0000-000000000009', NULL, '주 예수보다 더 귀한 것은 없네', '찬송가 137장', 'C', 88, 240, '주 예수보다 더 귀한 것은 없네
이 세상에 없네

그 사랑 얼마나 큰지
내가 매일 느끼네', 'C - F - C - G
C - F - G - C', ARRAY['사랑','찬양','고백'], '찬송가', 'system'),
  ('00000000-0000-0000-0000-000000000010', NULL, '고백합니다', '마커스 워십', 'Eb', 70, 300, '주님 앞에서 고백합니다
내가 부족한 줄 압니다

은혜로 여기까지 오게 하신
주님의 사랑 감사합니다', 'Eb - Bb/D - Cm - Gm
Eb - Bb - Gm - Eb

Bb - Eb - Cm - Fm7
Bb - Gm - Eb', ARRAY['고백','은혜','회개'], '워십', 'system'),
  ('00000000-0000-0000-0000-000000000011', NULL, '빛과 소금이 되리', '뉴젠 워십', 'G', 130, 210, '이 세상에 빛과 소금이 되리
어디에 있든지 주 이름 빛날 때까지

주님이 함께 하시니
두려워하지 않네', 'G - D/F# - Em - C
G - D - C - G

C - G - D - Em
C - D - G', ARRAY['선교','축제','찬양'], 'CCM', 'system'),
  ('00000000-0000-0000-0000-000000000012', NULL, '찬양의 제사', '어노인팅', 'D', 96, 280, '내 입술로 찬양의 제사 드리리
내 온 몸으로 경배드리리

주님만이 나의 하나님
영원히 찬양드리리', 'D - A/C# - Bm - G
D - A - G - D

G - D - A - Bm
G - A - D', ARRAY['찬양','경배'], 'CCM', 'system')
ON CONFLICT (id) DO NOTHING;

-- 샘플 콘티 (시스템 시드 — user_id 는 service role 의 placeholder 사용)
-- 실제 사용자 환경에서는 사용자가 직접 콘티를 만들어야 함
-- (이 부분은 service_role로만 실행되며 일반 사용자 환경에서는 무시됨)

-- =====================================================
-- 팀 관리 (Phase 10)
-- =====================================================

-- 4. 팀
CREATE TABLE IF NOT EXISTS conti_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  memo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conti_teams_user_id ON conti_teams(user_id);

-- 5. 팀원
CREATE TABLE IF NOT EXISTS conti_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES conti_teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  primary_role TEXT DEFAULT 'vocal1',
  color TEXT DEFAULT 'sky',
  joined_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conti_team_members_team_id ON conti_team_members(team_id);

-- 6. 콘티별 역할 배정
CREATE TABLE IF NOT EXISTS conti_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conti_id UUID NOT NULL REFERENCES conti_sets(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES conti_team_members(id) ON DELETE CASCADE,
  song_position INTEGER DEFAULT 0,
  role TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conti_assignments_conti_id ON conti_assignments(conti_id);
CREATE INDEX IF NOT EXISTS idx_conti_assignments_member_id ON conti_assignments(member_id);

-- =====================================================
-- 팀 RLS
-- =====================================================

ALTER TABLE conti_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE conti_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conti_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conti_teams_select" ON conti_teams;
CREATE POLICY "conti_teams_select" ON conti_teams FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "conti_teams_insert" ON conti_teams;
CREATE POLICY "conti_teams_insert" ON conti_teams FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "conti_teams_update" ON conti_teams;
CREATE POLICY "conti_teams_update" ON conti_teams FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "conti_teams_delete" ON conti_teams;
CREATE POLICY "conti_teams_delete" ON conti_teams FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "conti_team_members_all" ON conti_team_members;
CREATE POLICY "conti_team_members_all" ON conti_team_members FOR ALL
  USING (
    EXISTS (SELECT 1 FROM conti_teams WHERE conti_teams.id = conti_team_members.team_id AND conti_teams.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM conti_teams WHERE conti_teams.id = conti_team_members.team_id AND conti_teams.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "conti_assignments_all" ON conti_assignments;
CREATE POLICY "conti_assignments_all" ON conti_assignments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM conti_sets WHERE conti_sets.id = conti_assignments.conti_id AND conti_sets.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM conti_sets WHERE conti_sets.id = conti_assignments.conti_id AND conti_sets.user_id = auth.uid())
  );

DROP TRIGGER IF EXISTS trg_conti_teams_updated_at ON conti_teams;
CREATE TRIGGER trg_conti_teams_updated_at
  BEFORE UPDATE ON conti_teams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
