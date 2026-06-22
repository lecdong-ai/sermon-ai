-- api_usage: AI API 호출 추적 (관리자 전용)
-- OpenAI 응답의 usage를 캡처해 토큰/비용 기록
-- 회원 화면에는 절대 노출 안 됨, admin만 SELECT 가능

create table if not exists public.api_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  api_type text not null,
  model text not null,
  prompt_tokens int not null,
  completion_tokens int not null,
  total_tokens int not null,
  cost_usd numeric(10, 6) not null,
  cost_krw int not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- RLS: admin만 SELECT, INSERT는 service_role(서버)만
alter table public.api_usage enable row level security;

create policy "admin_can_select_api_usage"
  on public.api_usage for select
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- INSERT/UPDATE/DELETE: service_role로만 (RLS 우회)

-- 인덱스
create index if not exists idx_api_usage_user on public.api_usage(user_id);
create index if not exists idx_api_usage_created on public.api_usage(created_at desc);
create index if not exists idx_api_usage_user_created on public.api_usage(user_id, created_at desc);

-- 코멘트
comment on table public.api_usage is 'AI API 호출 추적. admin 전용. RLS: admin만 SELECT 가능.';
