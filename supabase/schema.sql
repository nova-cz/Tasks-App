-- Supabase schema for v0-task-management-app
-- Copy/paste this in Supabase > SQL Editor and run

-- Enable pgcrypto for gen_random_uuid (usually enabled by default in Supabase)
create extension if not exists pgcrypto;

-- Sections table (per-user)
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text default 'bg-blue-500',
  created_at timestamp with time zone default now()
);

-- Tasks table (per-user)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  status text not null default 'pending' check (status in ('pending','in-progress','completed')),
  date date,
  time time without time zone,
  tags text[] default '{}',
  created_at timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_sections_user on public.sections(user_id);
create index if not exists idx_tasks_user on public.tasks(user_id);
create index if not exists idx_tasks_section on public.tasks(section_id);
create index if not exists idx_tasks_date on public.tasks(date);

-- RLS policies
alter table public.sections enable row level security;
alter table public.tasks enable row level security;

-- Sections policies (owner-based)
create policy if not exists "sections_select_own" on public.sections
  for select using (auth.uid() = user_id);
create policy if not exists "sections_insert_own" on public.sections
  for insert with check (auth.uid() = user_id);
create policy if not exists "sections_update_own" on public.sections
  for update using (auth.uid() = user_id);
create policy if not exists "sections_delete_own" on public.sections
  for delete using (auth.uid() = user_id);

-- Tasks policies (owner-based)
create policy if not exists "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);
create policy if not exists "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy if not exists "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id);
create policy if not exists "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

-- Optional: a default section on first sign-in could be created via an edge function or client logic.
