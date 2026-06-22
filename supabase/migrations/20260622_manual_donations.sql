-- manual_donations: 관리자가 수동으로 입력한 후원 내역
-- payment_history(자동)와 별개로 admin이 직접 입력
-- 회원 화면 노출 ❌, admin만 SELECT 가능

create table if not exists public.manual_donations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_krw int not null check (amount_krw > 0),
  note text,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null
);

-- RLS: admin만 SELECT, INSERT/UPDATE/DELETE는 service_role(서버 API)
alter table public.manual_donations enable row level security;

create policy "admin_can_select_manual_donations"
  on public.manual_donations for select
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- 인덱스
create index if not exists idx_manual_donations_user on public.manual_donations(user_id);
create index if not exists idx_manual_donations_created on public.manual_donations(created_at desc);
create index if not exists idx_manual_donations_user_created on public.manual_donations(user_id, created_at desc);

-- 코멘트
comment on table public.manual_donations is '관리자 수동 입력 후원 내역. admin 전용. RLS: admin만 SELECT.';
