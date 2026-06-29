-- =====================================================
-- lecdong@gmail.com 계정에 콘티 시드 (콘티만)
-- =====================================================
-- 이전에 team INSERT 에러로 인해 콘티도 안 만들어졌을 수 있음

DO $$
DECLARE
  v_user_id UUID;
  v_conti_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'lecdong@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User lecdong@gmail.com not found';
  END IF;

  RAISE NOTICE 'User ID: %', v_user_id;

  -- 콘티 1: 주일 오전 (곡 3개) — IF NOT EXISTS 로 중복 방지
  IF NOT EXISTS (
    SELECT 1 FROM conti_sets
    WHERE user_id = v_user_id AND title = '2025-07-06 주일 오전 예배'
  ) THEN
    v_conti_id := gen_random_uuid();
    INSERT INTO conti_sets (id, user_id, title, date, worship_type, memo)
    VALUES (v_conti_id, v_user_id, '2025-07-06 주일 오전 예배', '2025-07-06', 'sunday_am', '여름 가정의 달 특별 예배');

    INSERT INTO conti_items (conti_id, song_id, position, key, bpm_override) VALUES
      (v_conti_id, '00000000-0000-0000-0000-000000000001', 1, 'C', NULL),
      (v_conti_id, '00000000-0000-0000-0000-000000000007', 2, 'A', 124),
      (v_conti_id, '00000000-0000-0000-0000-000000000011', 3, 'G', 132);

    RAISE NOTICE 'Created conti 1 (3 songs)';
  ELSE
    RAISE NOTICE 'Conti 1 already exists, skipping';
  END IF;

  -- 콘티 2: 수요 예배
  IF NOT EXISTS (
    SELECT 1 FROM conti_sets
    WHERE user_id = v_user_id AND title = '2025-07-09 수요 예배'
  ) THEN
    INSERT INTO conti_sets (id, user_id, title, date, worship_type, memo)
    VALUES (gen_random_uuid(), v_user_id, '2025-07-09 수요 예배', '2025-07-09', 'wednesday', '수요 소그룹 모임 후');
    RAISE NOTICE 'Created conti 2';
  ELSE
    RAISE NOTICE 'Conti 2 already exists, skipping';
  END IF;
END $$;

-- 즉시 확인
SELECT cs.title, cs.date, count(ci.id) AS songs
FROM conti_sets cs
LEFT JOIN conti_items ci ON ci.conti_id = cs.id
WHERE cs.user_id = (SELECT id FROM auth.users WHERE email = 'lecdong@gmail.com')
GROUP BY cs.id, cs.title, cs.date
ORDER BY cs.date;
