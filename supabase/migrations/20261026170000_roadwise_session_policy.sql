-- Roadwise identifies anonymous browsers using an unguessable session UUID.
-- Keep this policy scoped to Roadwise; other Lawn tables are unchanged.
begin;

drop policy if exists "Roadwise private attempts" on public.roadwise_attempts;
create policy "Roadwise private attempts" on public.roadwise_attempts
 for all to anon, authenticated
 using (
  session_id::text = (
   nullif(current_setting('request.headers', true), '')::jsonb
   ->> 'x-roadwise-session'
  )
 )
 with check (
  session_id::text = (
   nullif(current_setting('request.headers', true), '')::jsonb
   ->> 'x-roadwise-session'
  )
 );

commit;
