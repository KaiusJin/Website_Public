-- Split the legacy experiences table into three independently managed collections.
-- Run after 202609150001_journey_cms.sql.
begin;

create table if not exists public.work_experiences (
 id uuid primary key default gen_random_uuid(), title text, date_badge text, role text, role_icon text,
 bullets jsonb, link text, link_text text, start_date text, end_date text, is_present boolean,
 visibility text not null default 'public' check(visibility in ('public','draft','private','archived')),
 "order" integer not null default 0, created_at timestamptz not null default now(), skills jsonb,
 translations jsonb not null default '{}'::jsonb, updated_at timestamptz not null default clock_timestamp()
);
create table if not exists public.club_experiences (
 id uuid primary key default gen_random_uuid(), title text, date_badge text, role text, role_icon text,
 bullets jsonb, link text, link_text text, start_date text, end_date text, is_present boolean,
 visibility text not null default 'public' check(visibility in ('public','draft','private','archived')),
 "order" integer not null default 0, created_at timestamptz not null default now(), skills jsonb,
 translations jsonb not null default '{}'::jsonb, updated_at timestamptz not null default clock_timestamp()
);
create table if not exists public.volunteer_experiences (
 id uuid primary key default gen_random_uuid(), title text, date_badge text, role text, role_icon text,
 bullets jsonb, link text, link_text text, start_date text, end_date text, is_present boolean,
 visibility text not null default 'public' check(visibility in ('public','draft','private','archived')),
 "order" integer not null default 0, created_at timestamptz not null default now(), skills jsonb,
 translations jsonb not null default '{}'::jsonb, updated_at timestamptz not null default clock_timestamp()
);

-- Every existing experience is work experience unless moved later through Admin.
do $$ begin
 if to_regclass('public.experiences') is not null then
  execute $copy$
   insert into public.work_experiences
    (id,title,date_badge,role,role_icon,bullets,link,link_text,start_date,end_date,is_present,visibility,"order",created_at,skills,translations,updated_at)
   select id,title,date_badge,role,role_icon,bullets,link,link_text,start_date,end_date,is_present,
    coalesce(visibility,'public'),coalesce("order",0),coalesce(created_at,now()),skills,coalesce(translations,'{}'::jsonb),coalesce(updated_at,clock_timestamp())
   from public.experiences
   on conflict(id) do nothing
  $copy$;
 end if;
end $$;

-- Existing unpublished experience drafts become work-experience drafts.
alter table public.content_drafts drop constraint if exists content_drafts_target_table_check;
update public.content_drafts set target_table='work_experiences' where target_table='experiences';
alter table public.content_drafts add constraint content_drafts_target_table_check check(target_table in (
 'projects','work_experiences','club_experiences','volunteer_experiences','skills','awards',
 'site_profile','personal_entries','journey_scene_content'
));

do $$ declare t text; begin
 foreach t in array array['work_experiences','club_experiences','volunteer_experiences'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('drop trigger if exists journey_updated_at on public.%I',t);
  execute format('create trigger journey_updated_at before update on public.%I for each row execute function public.journey_touch()',t);
  if not exists(select 1 from pg_policies where schemaname='public' and tablename=t and policyname='Journey administrator') then
   execute format('create policy "Journey administrator" on public.%I for all to authenticated using (public.journey_is_admin()) with check (public.journey_is_admin())',t);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename=t and policyname='Published journey content') then
   execute format('create policy "Published journey content" on public.%I for select to anon,authenticated using (visibility=''public'')',t);
  end if;
 end loop;
end $$;

grant select on public.work_experiences,public.club_experiences,public.volunteer_experiences to anon;
grant select,insert,update,delete on public.work_experiences,public.club_experiences,public.volunteer_experiences to authenticated;

create or replace function public.journey_fields(t text) returns text[]
language sql immutable set search_path = '' as $$
 select case t
 when 'projects' then array['title','date_badge','bullets','skills','github_link','start_date','end_date','is_present','link_text','link','image_url','image_alt'] || array['translations','visibility','order']
 when 'work_experiences' then array['title','date_badge','role','role_icon','bullets','link','link_text','start_date','end_date','is_present','skills'] || array['translations','visibility','order']
 when 'club_experiences' then array['title','date_badge','role','role_icon','bullets','link','link_text','start_date','end_date','is_present','skills'] || array['translations','visibility','order']
 when 'volunteer_experiences' then array['title','date_badge','role','role_icon','bullets','link','link_text','start_date','end_date','is_present','skills'] || array['translations','visibility','order']
 when 'awards' then array['title','organization','year','description','bullets','link','link_text'] || array['translations','visibility','order']
 when 'skills' then array['category','category_slug','skills'] || array['translations','visibility','order']
 when 'site_profile' then array['heading','intro','bio','location','email','github','linkedin','resume_url'] || array['translations','visibility','order']
 when 'personal_entries' then array['kind','title','body','date','images','external_url'] || array['translations','visibility','order']
 when 'journey_scene_content' then array['scene_id','title','description'] || array['translations','visibility','order']
 else null end
$$;

-- The legacy table is removed only after its live rows and drafts have been migrated.
drop table if exists public.experiences;
notify pgrst,'reload schema';
commit;
