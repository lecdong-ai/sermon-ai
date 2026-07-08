-- PPT 이미지 생성 한도 카운트 테이블
-- ppt_image action의 period(30일 롤링) 내 생성 횟수를 추적
-- limits.ts의 countPptImageInPeriod()가 사용

create table if not exists public.ppt_image_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sermon_id uuid references public.sermons(id) on delete set null,
  slide_index int,
  mode text check (mode in ('hybrid', 'full')),
  created_at timestamptz not null default now()
);

-- period 내 카운트 조회용 인덱스
create index if not exists ppt_image_generations_user_period_idx
  on public.ppt_image_generations (user_id, created_at);

-- RLS: 사용자는 본인 기록만 조회
alter table public.ppt_image_generations enable row level security;

drop policy if exists "ppt_image_generations owner select" on public.ppt_image_generations;
create policy "ppt_image_generations owner select"
  on public.ppt_image_generations for select
  using (auth.uid() = user_id);

-- service role은 RLS 우회 (supabaseAdmin으로 insert/count)
