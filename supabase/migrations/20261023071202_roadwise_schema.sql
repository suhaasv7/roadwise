-- Roadwise uses its own tables in the existing Lawn project.
create table public.roadwise_questions (
 id text primary key,
 category text not null check (category in ('signs','rules')),
 topic text not null,
 prompt text not null,
 options jsonb not null check (jsonb_array_length(options) between 3 and 4),
 answer integer not null check (answer between 0 and 3),
 image text,
 explanation text not null,
 source_url text not null,
 source_ref text not null,
 imported_at date not null
);
alter table public.roadwise_questions enable row level security;
grant select on public.roadwise_questions to anon, authenticated;
create policy "Roadwise bank read" on public.roadwise_questions for select to anon, authenticated using (true);

create table public.roadwise_attempts (
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null,
 mode text not null check (mode in ('mixed','signs','rules','mistakes')),
 status text not null default 'in_progress' check (status in ('in_progress','completed')),
 question_ids jsonb not null check (jsonb_array_length(question_ids) between 1 and 50),
 answers jsonb,
 score integer,
 total integer not null check (total between 1 and 50),
 started_at timestamptz not null default now(),
 completed_at timestamptz,
 duration_seconds integer check (duration_seconds >= 0),
 check (score is null or score between 0 and total)
);
create index roadwise_attempts_session_started on public.roadwise_attempts(session_id, started_at desc);
alter table public.roadwise_attempts enable row level security;
grant select, insert, update on public.roadwise_attempts to anon, authenticated;
create policy "Roadwise private attempts" on public.roadwise_attempts for all to anon, authenticated
 using (public.lawn_is_owner() and session_id::text = (nullif(current_setting('request.headers',true),'')::jsonb ->> 'x-roadwise-session'))
 with check (public.lawn_is_owner() and session_id::text = (nullif(current_setting('request.headers',true),'')::jsonb ->> 'x-roadwise-session'));
