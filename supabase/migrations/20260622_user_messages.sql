-- user_messages: 사용자 ↔ 관리자 소통 통로
-- 카테고리: question(질문) | request(요청) | bug(버그) | praise(칭찬)
-- 상태: open(대기) | in_progress(처리중) | resolved(해결) | wontfix(처리안함)

create table if not exists public.user_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('question', 'request', 'bug', 'praise')),
  subject text,
  message text not null check (length(message) between 1 and 500),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'wontfix')),
  admin_reply text,
  admin_replied_at timestamptz,
  replied_by uuid references auth.users(id),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: 사용자는 자기 메시지만 SELECT, admin은 모두 SELECT/UPDATE
alter table public.user_messages enable row level security;

-- 사용자: 자기 메시지 SELECT
create policy "users_select_own_messages"
  on public.user_messages for select
  using (auth.uid() = user_id);

-- 사용자: 자기 메시지 INSERT
create policy "users_insert_messages"
  on public.user_messages for insert
  with check (auth.uid() = user_id);

-- admin: 모든 메시지 SELECT
create policy "admin_select_all_messages"
  on public.user_messages for select
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- admin: 모든 메시지 UPDATE (답변, 상태 변경)
create policy "admin_update_messages"
  on public.user_messages for update
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- 인덱스
create index if not exists idx_user_messages_user_created
  on public.user_messages(user_id, created_at desc);

create index if not exists idx_user_messages_status_created
  on public.user_messages(status, created_at desc);

create index if not exists idx_user_messages_category_created
  on public.user_messages(category, created_at desc);

-- updated_at 자동 갱신 트리거
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_messages_touch on public.user_messages;
create trigger trg_user_messages_touch
  before update on public.user_messages
  for each row execute function public.touch_updated_at();

comment on table public.user_messages is '사용자 ↔ 관리자 메시지. 사용자: 자기 것만. admin: 모두 SELECT/UPDATE.';
comment on column public.user_messages.category is 'question(질문) | request(요청) | bug(버그) | praise(칭찬)';
comment on column public.user_messages.status is 'open(대기) | in_progress(처리중) | resolved(해결) | wontfix(처리안함)';
