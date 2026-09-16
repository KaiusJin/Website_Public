-- Remove the retired draft/visibility/translation workflow. Admin writes one English live record directly.
begin;

drop function if exists public.journey_save_draft(text,uuid,jsonb,timestamptz,timestamptz);
drop function if exists public.journey_publish(uuid,timestamptz);
drop table if exists public.content_drafts;

do $$
declare
 t text;
 p record;
begin
 foreach t in array array[
  'projects','work_experiences','club_experiences','volunteer_experiences',
  'skills','awards','site_profile','personal_entries','journey_scene_content'
 ] loop
  for p in
   select policyname from pg_policies
   where schemaname='public' and tablename=t and cmd='SELECT'
  loop
   execute format('drop policy %I on public.%I',p.policyname,t);
  end loop;
  execute format('alter table public.%I drop column if exists visibility, drop column if exists translations',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select on public.%I to anon',t);
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  execute format('create policy "Public content" on public.%I for select to anon, authenticated using (true)',t);
 end loop;
end $$;

-- Media is uploaded directly to the public media bucket; it no longer has a status field.
alter table public.media_assets drop column if exists visibility;
revoke all on public.media_assets from anon, authenticated;
grant select,insert,update,delete on public.media_assets to authenticated;

create or replace function public.journey_fields(t text) returns text[]
language sql immutable set search_path = '' as $$
 select case t
 when 'projects' then array['title','date_badge','bullets','skills','github_link','start_date','end_date','is_present','link_text','link','image_url','image_alt','order']
 when 'work_experiences' then array['title','date_badge','role','role_icon','bullets','link','link_text','start_date','end_date','is_present','skills','order']
 when 'club_experiences' then array['title','date_badge','role','role_icon','bullets','link','link_text','start_date','end_date','is_present','skills','order']
 when 'volunteer_experiences' then array['title','date_badge','role','role_icon','bullets','link','link_text','start_date','end_date','is_present','skills','order']
 when 'awards' then array['title','organization','year','description','bullets','link','link_text','order']
 when 'skills' then array['category','category_slug','skills','order']
 when 'site_profile' then array['heading','intro','bio','location','email','github','linkedin','resume_url','order']
 when 'personal_entries' then array['kind','title','body','date','images','external_url','order']
 when 'journey_scene_content' then array['scene_id','title','description','order']
 else null end
$$;

notify pgrst,'reload schema';
commit;
