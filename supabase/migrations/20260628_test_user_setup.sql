-- =====================================================
-- 테스트 사용자 + 콘티 (수정판 - ON CONFLICT 제거)
-- =====================================================
-- Supabase 대시보드 > SQL Editor에서 실행

-- 1) 검증
SELECT count(*) AS system_song_count FROM conti_songs WHERE user_id IS NULL;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'conti%' ORDER BY table_name;

-- 2) 테스트 사용자 생성 (ON CONFLICT 제거, 중복 체크 후 INSERT)
DO $$
DECLARE
  v_user_id UUID;
  v_identity_id UUID;
BEGIN
  -- 기존 사용자 확인
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'test@bunker.ai.kr';

  IF v_user_id IS NULL THEN
    -- 새 사용자 생성
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id,
      'authenticated', 'authenticated', 'test@bunker.ai.kr',
      crypt('Test1234!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}',
      now(), now(), '', '', '', ''
    );

    -- identity 생성 (email 컬�은 generated, 제외)
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'test@bunker.ai.kr', 'email_verified', true),
      'email', v_user_id::text, now(), now(), now()
    );

    RAISE NOTICE 'Created new user: %', v_user_id;
  ELSE
    RAISE NOTICE 'User already exists: %', v_user_id;
  END IF;
END $$;

-- 3) 테스트 콘티 시드
DO $$
DECLARE
  v_user_id UUID;
  v_conti_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'test@bunker.ai.kr';
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found - run step 2 first';
  END IF;

  -- 이미 콘티가 있는지 확인
  IF NOT EXISTS (SELECT 1 FROM conti_sets WHERE user_id = v_user_id) THEN
    -- 콘티 1: 주일 오전
    v_conti_id := gen_random_uuid();
    INSERT INTO conti_sets (id, user_id, title, date, worship_type, memo)
    VALUES (v_conti_id, v_user_id, '2025-07-06 주일 오전 예배', '2025-07-06', 'sunday_am', '여름 가정의 달 특별 예배');

    INSERT INTO conti_items (conti_id, song_id, position, key, bpm_override) VALUES
      (v_conti_id, '00000000-0000-0000-0000-000000000001', 1, 'C', NULL),
      (v_conti_id, '00000000-0000-0000-0000-000000000007', 2, 'A', 124),
      (v_conti_id, '00000000-0000-0000-0000-000000000011', 3, 'G', 132);

    -- 콘티 2: 수요 예배
    INSERT INTO conti_sets (id, user_id, title, date, worship_type, memo)
    VALUES (gen_random_uuid(), v_user_id, '2025-07-09 수요 예배', '2025-07-09', 'wednesday', '수요 소그룹 모임 후');

    RAISE NOTICE 'Created 2 contis for user: %', v_user_id;
  ELSE
    RAISE NOTICE 'Contis already exist for user: %', v_user_id;
  END IF;
END $$;

-- 4) 결과 확인
SELECT
  u.email,
  count(DISTINCT cs.id) AS conti_count,
  count(ci.id) AS total_songs
FROM auth.users u
LEFT JOIN conti_sets cs ON cs.user_id = u.id
LEFT JOIN conti_items ci ON ci.conti_id = cs.id
WHERE u.email = 'test@bunker.ai.kr'
GROUP BY u.email;
-- 기대: email=test@bunker.ai.kr, conti_count=2, total_songs=3

SELECT cs.title, cs.date, count(ci.id) AS songs
FROM conti_sets cs
LEFT JOIN conti_items ci ON ci.conti_id = cs.id
WHERE cs.user_id = (SELECT id FROM auth.users WHERE email = 'test@bunker.ai.kr')
GROUP BY cs.id, cs.title, cs.date
ORDER BY cs.date;
