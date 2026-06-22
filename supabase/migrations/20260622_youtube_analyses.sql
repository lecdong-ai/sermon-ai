-- Create youtube_analyses table for YouTubeLab
-- Each user can save AI analysis of YouTube videos for sermon preparation

create table if not exists public.youtube_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id text not null,
  title text,
  channel_name text,
  thumbnail_url text,
  video_url text not null,
  transcript jsonb,
  analysis jsonb not null,
  saved_insights jsonb default '[]'::jsonb,
  note_ids jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.youtube_analyses enable row level security;

create policy "Users can insert their own youtube analyses"
  on public.youtube_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own youtube analyses"
  on public.youtube_analyses for select
  using (auth.uid() = user_id);

create policy "Users can update their own youtube analyses"
  on public.youtube_analyses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own youtube analyses"
  on public.youtube_analyses for delete
  using (auth.uid() = user_id);

create index if not exists idx_youtube_analyses_user on public.youtube_analyses(user_id);
create index if not exists idx_youtube_analyses_video on public.youtube_analyses(video_id);

-- Updated_at trigger
create or replace function public.update_youtube_analyses_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_youtube_analyses_updated_at
  before update on public.youtube_analyses
  for each row
  execute function public.update_youtube_analyses_updated_at();
