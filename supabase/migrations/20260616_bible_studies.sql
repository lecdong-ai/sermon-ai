create table public.bible_studies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  book text not null,
  chapter int not null,
  verse_start int not null,
  verse_end int,
  passage text not null,
  study_data jsonb not null,
  memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bible_studies enable row level security;

create policy "Users can insert their own bible studies"
  on public.bible_studies for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own bible studies"
  on public.bible_studies for select
  using (auth.uid() = user_id);

create policy "Users can update their own bible studies"
  on public.bible_studies for update
  using (auth.uid() = user_id);

create policy "Users can delete their own bible studies"
  on public.bible_studies for delete
  using (auth.uid() = user_id);
