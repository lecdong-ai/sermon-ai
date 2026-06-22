-- admin_notifications: 관리자 알림 (admin만 SELECT 가능, INSERT는 service_role)
-- 이벤트: 새 회원가입, 후원/결제, API quota 경고, 에러 등

create table if not exists public.admin_notifications (
  id uuid default gen_random_uuid() primary key,
  type text not null,                      -- 'new_user' | 'new_donation' | 'quota_warning' | 'error' | 'system'
  title text not null,
  message text not null,
  link text,                                -- 클릭 시 이동할 URL
  related_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- RLS: admin만 SELECT/UPDATE, INSERT는 service_role(서버)만
alter table public.admin_notifications enable row level security;

create policy "admin_can_select_notifications"
  on public.admin_notifications for select
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

create policy "admin_can_update_notifications"
  on public.admin_notifications for update
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- INSERT: service_role만 (RLS 우회)

-- 인덱스
create index if not exists idx_admin_notifications_read_created
  on public.admin_notifications(read, created_at desc);

create index if not exists idx_admin_notifications_type
  on public.admin_notifications(type, created_at desc);

comment on table public.admin_notifications is '관리자 알림. admin만 SELECT/UPDATE 가능. INSERT는 service_role(서버 API).';
comment on column public.admin_notifications.type is '알림 종류: new_user, new_donation, quota_warning, error, system';

-- ─── Trigger: 새 회원가입 시 자동 알림 ───
create or replace function public.notify_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_notifications (type, title, message, link, related_user_id, metadata)
  values (
    'new_user',
    '새 회원 가입',
    coalesce(new.email, 'unknown') || ' 님이 가입했습니다.',
    '/admin/users?focus=' || new.id::text,
    new.id,
    jsonb_build_object('email', new.email, 'created_at', new.created_at)
  );
  return new;
end;
$$;

-- auth.users는 스키마가 auth에 있어서 별도 trigger 함수 필요
drop trigger if exists trg_notify_new_user on auth.users;
create trigger trg_notify_new_user
  after insert on auth.users
  for each row execute function public.notify_new_user();
