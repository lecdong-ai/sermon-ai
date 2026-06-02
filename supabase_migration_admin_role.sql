-- user_profiles 테이블에 role 컬럼 추가
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- lecdong@gmail.com 계정에 admin role 부여 (auth.users 테이블과 조인 필요)
UPDATE user_profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'lecdong@gmail.com');
