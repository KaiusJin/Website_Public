-- Remove compatibility that no longer has an application caller or live data.
begin;

drop function if exists public.journey_reorder(text, jsonb);
drop function if exists public.journey_fields(text);

alter table public.projects drop column if exists date_badge;
alter table public.work_experiences drop column if exists date_badge;
alter table public.club_experiences drop column if exists date_badge;
alter table public.volunteer_experiences drop column if exists date_badge;

do $$
declare
 table_name text;
begin
 foreach table_name in array array['projects', 'skills', 'awards'] loop
  execute format('drop policy if exists "Admin full access" on public.%I', table_name);
  execute format('drop policy if exists "Journey administrator" on public.%I', table_name);
  execute format(
   'create policy "Journey administrator" on public.%I for all to authenticated using (public.journey_is_admin()) with check (public.journey_is_admin())',
   table_name
  );
 end loop;
end $$;

notify pgrst, 'reload schema';
commit;
