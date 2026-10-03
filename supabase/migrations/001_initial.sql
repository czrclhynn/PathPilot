-- Run in the Supabase SQL editor. Authentication identities live in auth.users.
create table public.career_paths (id uuid primary key default gen_random_uuid(), name text unique not null, description text not null);
create table public.skills (id uuid primary key default gen_random_uuid(), name text unique not null, category text not null);
create table public.profiles (user_id uuid primary key references auth.users(id) on delete cascade, name text not null, degree text, year_level text, school text, graduation_year integer, career_id uuid references public.career_paths(id));
create table public.user_skills (user_id uuid references auth.users(id) on delete cascade, skill_id uuid references public.skills(id), proficiency text check(proficiency in ('Beginner','Intermediate','Advanced')), primary key(user_id,skill_id));
create table public.certifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, issuer text, earned_at date, credential_url text);
create table public.projects (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, description text, technologies text[], github_url text, demo_url text, category text);
create table public.roadmaps (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, career_id uuid references public.career_paths(id), created_at timestamptz default now());
create table public.roadmap_stages (id uuid primary key default gen_random_uuid(), roadmap_id uuid not null references public.roadmaps(id) on delete cascade, name text not null, position integer not null);
create table public.roadmap_items (id uuid primary key default gen_random_uuid(), stage_id uuid not null references public.roadmap_stages(id) on delete cascade, title text not null, description text, status text not null default 'not_started' check(status in ('not_started','in_progress','completed')), position integer not null default 0);
create table public.project_recommendations (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, recommendation jsonb not null);
create table public.weekly_plans (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, plan jsonb not null, week_start date not null);
create table public.achievements (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, earned_at timestamptz default now(), unique(user_id,name));
create table public.ai_conversations (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, messages jsonb not null default '[]', created_at timestamptz default now());
-- Version-one aggregate persistence keeps guest and authenticated workflows equivalent.
-- Normalized tables above support later analytics and independent entity updates.
create table public.student_states (user_id uuid primary key references auth.users(id) on delete cascade, state jsonb not null, updated_at timestamptz not null default now());
create function public.touch_student_state() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end; $$;
create trigger touch_student_state before update on public.student_states for each row execute function public.touch_student_state();
alter table public.career_paths enable row level security;
alter table public.skills enable row level security;
create policy "Read career catalog" on public.career_paths for select to anon,authenticated using(true);
create policy "Read skill catalog" on public.skills for select to anon,authenticated using(true);
do $$ declare t text; begin foreach t in array array['profiles','user_skills','certifications','projects','roadmaps','project_recommendations','weekly_plans','achievements','ai_conversations','student_states'] loop execute format('alter table public.%I enable row level security',t); execute format('create policy "Own records only" on public.%I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',t); end loop; end $$;
alter table public.roadmap_stages enable row level security;
create policy "Own roadmap stages" on public.roadmap_stages for all to authenticated using(exists(select 1 from public.roadmaps r where r.id=roadmap_id and r.user_id=auth.uid())) with check(exists(select 1 from public.roadmaps r where r.id=roadmap_id and r.user_id=auth.uid()));
alter table public.roadmap_items enable row level security;
create policy "Own roadmap items" on public.roadmap_items for all to authenticated using(exists(select 1 from public.roadmap_stages s join public.roadmaps r on r.id=s.roadmap_id where s.id=stage_id and r.user_id=auth.uid())) with check(exists(select 1 from public.roadmap_stages s join public.roadmaps r on r.id=s.roadmap_id where s.id=stage_id and r.user_id=auth.uid()));
create index roadmap_owner on public.roadmaps(user_id);
create index roadmap_stage_parent on public.roadmap_stages(roadmap_id);
create index roadmap_item_parent on public.roadmap_items(stage_id);
