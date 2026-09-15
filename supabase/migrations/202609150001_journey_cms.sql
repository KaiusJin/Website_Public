-- Additive content migration. Existing records and administrator identity are preserved.
-- Reviewed against production columns/policies on 2026-09-15.
begin;
create or replace function public.journey_is_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
 select coalesce(auth.jwt()->>'email' = 'kaixuan.jin@outlook.com', false)
$$;
create or replace function public.journey_touch() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at = clock_timestamp(); return new; end $$;

do $$ declare t text; begin
 foreach t in array array['projects','experiences','skills','awards'] loop
  execute format('alter table public.%I add column if not exists translations jsonb not null default ''{}''::jsonb, add column if not exists updated_at timestamptz not null default clock_timestamp()',t);
 end loop;
end $$;
alter table public.projects add column if not exists image_url text, add column if not exists image_alt text;
create table if not exists public.site_profile (
 id uuid primary key default gen_random_uuid(), singleton boolean not null default true unique check(singleton),
 heading text not null default '', intro text not null default '', bio text not null default '', location text,
 email text, github text, linkedin text, resume_url text,
 translations jsonb not null default '{}', visibility text not null default 'draft' check(visibility in ('public','draft','private','archived')),
 "order" integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.personal_entries (
 id uuid primary key default gen_random_uuid(), kind text not null check(kind in ('photography','travel','daily','music')),
 title text not null, body text, date text, images jsonb not null default '[]' check(jsonb_typeof(images)='array'), external_url text,
 translations jsonb not null default '{}', visibility text not null default 'draft' check(visibility in ('public','draft','private','archived')),
 "order" integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.journey_scene_content (
 id uuid primary key default gen_random_uuid(), scene_id text not null unique check(scene_id in ('cottage','meadow','town','library','academy','lake','station')),
 title text not null, description text, translations jsonb not null default '{}',
 visibility text not null default 'draft' check(visibility in ('public','draft','private','archived')),
 "order" integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.content_drafts (
 id uuid primary key default gen_random_uuid(), target_table text not null check(target_table in ('projects','experiences','skills','awards','site_profile','personal_entries','journey_scene_content')),
 target_id uuid not null, payload jsonb not null check(jsonb_typeof(payload)='object'), base_revision timestamptz,
 state text not null default 'draft' check(state in ('draft','published','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(target_table,target_id)
);
create table if not exists public.media_assets (
 id uuid primary key default gen_random_uuid(), path text not null unique, name text not null, mime text not null,
 size bigint not null check(size > 0 and size <= 20971520), alt text not null default '', caption text not null default '',
 visibility text not null default 'private' check(visibility in ('private','public','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- Preserve the old administrator policy; restrict every old unconditional SELECT policy.
do $$ declare t text; p record; begin
 foreach t in array array['projects','experiences','skills','awards','site_profile','personal_entries','journey_scene_content','content_drafts','media_assets'] loop
  execute format('alter table public.%I enable row level security',t);
  if t in ('projects','experiences','skills','awards') then
   for p in select policyname from pg_policies where schemaname='public' and tablename=t and cmd='SELECT' loop
    execute format('alter policy %I on public.%I using (visibility = ''public'')',p.policyname,t);
   end loop;
  else
   execute format('create policy "Journey administrator" on public.%I for all to authenticated using (public.journey_is_admin()) with check (public.journey_is_admin())',t);
   if t not in ('content_drafts','media_assets') then
    execute format('create policy "Published journey content" on public.%I for select to anon, authenticated using (visibility = ''public'')',t);
   end if;
  end if;
  execute format('create trigger journey_updated_at before update on public.%I for each row execute function public.journey_touch()',t);
 end loop;
end $$;
grant select on public.site_profile, public.personal_entries, public.journey_scene_content to anon;
grant select,insert,update,delete on public.site_profile,public.personal_entries,public.journey_scene_content,public.content_drafts,public.media_assets to authenticated;
revoke all on public.content_drafts,public.media_assets from anon;

-- A narrow allowlist protects the dynamic record publisher from arbitrary table/column writes.
create or replace function public.journey_fields(t text) returns text[]
language sql immutable set search_path = '' as $$
 select case t
 when 'projects' then array['title','date_badge','bullets','skills','github_link','start_date','end_date','is_present','link_text','link','image_url','image_alt'] || array['translations','visibility','order']
 when 'experiences' then array['title','date_badge','role','role_icon','bullets','link','link_text','start_date','end_date','is_present','skills'] || array['translations','visibility','order']
 when 'awards' then array['title','organization','year','description','bullets','link','link_text'] || array['translations','visibility','order']
 when 'skills' then array['category','category_slug','skills'] || array['translations','visibility','order']
 when 'site_profile' then array['heading','intro','bio','location','email','github','linkedin','resume_url'] || array['translations','visibility','order']
 when 'personal_entries' then array['kind','title','body','date','images','external_url'] || array['translations','visibility','order']
 when 'journey_scene_content' then array['scene_id','title','description'] || array['translations','visibility','order']
 else null end
$$;
create or replace function public.journey_save_draft(p_table text,p_target uuid,p_payload jsonb,p_base timestamptz,p_expected timestamptz)
returns public.content_drafts language plpgsql security invoker set search_path = '' as $$
declare d public.content_drafts; k text; allowed text[];
begin
 if not public.journey_is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 allowed := public.journey_fields(p_table);
 if allowed is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'Invalid content'; end if;
 for k in select jsonb_object_keys(p_payload) loop
  if not k = any(allowed) then raise exception 'Unsupported field: %',k; end if;
 end loop;
 if p_payload->>'visibility' is null or p_payload->>'visibility' not in ('public','draft','private','archived') then raise exception 'Choose a visibility'; end if;
 if p_payload ? 'translations' and jsonb_typeof(p_payload->'translations') <> 'object' then raise exception 'Translations must be an object'; end if;
 select * into d from public.content_drafts where target_table=p_table and target_id=p_target for update;
 if found then
  if d.updated_at is distinct from p_expected then raise exception 'This draft changed in another session. Reload before saving.' using errcode='40001'; end if;
  update public.content_drafts set payload=p_payload,base_revision=p_base,state='draft' where id=d.id returning * into d;
 else
  if p_expected is not null then raise exception 'Draft no longer exists. Reload.' using errcode='40001'; end if;
  insert into public.content_drafts(target_table,target_id,payload,base_revision) values(p_table,p_target,p_payload,p_base) returning * into d;
 end if;
 return d;
end $$;
create or replace function public.journey_publish(p_draft uuid,p_expected timestamptz)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare d public.content_drafts; current_row jsonb; result jsonb; cols text; vals text; assignments text; k text; allowed text[];
begin
 if not public.journey_is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 select * into d from public.content_drafts where id=p_draft for update;
 if not found or d.state <> 'draft' then raise exception 'Save a draft before publishing'; end if;
 if d.updated_at is distinct from p_expected then raise exception 'Draft changed. Reload before publishing.' using errcode='40001'; end if;
 allowed := public.journey_fields(d.target_table);
 if allowed is null then raise exception 'Invalid table'; end if;
 for k in select jsonb_object_keys(d.payload) loop
  if not k = any(allowed) then raise exception 'Unsupported field'; end if;
 end loop;
 execute format('select to_jsonb(t) from public.%I t where id=$1 for update',d.target_table) into current_row using d.target_id;
 if (current_row->>'updated_at')::timestamptz is distinct from d.base_revision then raise exception 'Published content changed. Reload and merge your draft.' using errcode='40001'; end if;
 select string_agg(format('%I',key),','),string_agg(format('r.%I',key),','),string_agg(format('%I=r.%I',key,key),',')
 into cols,vals,assignments from jsonb_object_keys(d.payload) key;
 if current_row is null then
  execute format('insert into public.%I as t (id,%s) select $1,%s from jsonb_populate_record(null::public.%I,$2) r returning to_jsonb(t)',d.target_table,cols,vals,d.target_table) into result using d.target_id,d.payload;
 else
  execute format('update public.%I t set %s from jsonb_populate_record(null::public.%I,$2) r where t.id=$1 returning to_jsonb(t)',d.target_table,assignments,d.target_table) into result using d.target_id,d.payload;
 end if;
 update public.content_drafts set state='published',base_revision=(result->>'updated_at')::timestamptz where id=d.id;
 return result;
end $$;
-- Reordering is atomic; a stale or incomplete list is rejected rather than inserting missing rows.
create or replace function public.journey_reorder(p_table text,p_rows jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare entry jsonb; revision timestamptz; n integer; total integer;
begin
 if not public.journey_is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 if public.journey_fields(p_table) is null or jsonb_typeof(p_rows)<>'array' then raise exception 'Invalid order request'; end if;
 execute format('lock table public.%I in share row exclusive mode',p_table);
 execute format('select count(*) from public.%I',p_table) into total;
 select count(distinct e->>'id') into n from jsonb_array_elements(p_rows)e;
 if n<>total or n<>jsonb_array_length(p_rows) then raise exception 'Content changed. Reload before reordering.' using errcode='40001'; end if;
 n:=0;
 for entry in select * from jsonb_array_elements(p_rows) loop
  execute format('select updated_at from public.%I where id=$1 for update',p_table) into revision using (entry->>'id')::uuid;
  if revision is null or revision is distinct from (entry->>'updated_at')::timestamptz then raise exception 'Content changed. Reload before reordering.' using errcode='40001'; end if;
  execute format('update public.%I set "order"=$1 where id=$2',p_table) using n,(entry->>'id')::uuid;
  n:=n+1;
 end loop;
end $$;
revoke all on function public.journey_save_draft(text,uuid,jsonb,timestamptz,timestamptz),public.journey_publish(uuid,timestamptz),public.journey_reorder(text,jsonb) from public,anon;
grant execute on function public.journey_save_draft(text,uuid,jsonb,timestamptz,timestamptz),public.journey_publish(uuid,timestamptz),public.journey_reorder(text,jsonb) to authenticated;
-- Files remain private until the administrator explicitly publishes them in the media library.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('journey-drafts','journey-drafts',false,20971520,array['image/jpeg','image/png','image/webp','image/avif','audio/mpeg','audio/ogg','audio/wav','application/pdf']),
 ('journey-media','journey-media',true,20971520,array['image/jpeg','image/png','image/webp','image/avif','audio/mpeg','audio/ogg','audio/wav','application/pdf'])
on conflict(id) do nothing;
create policy "Journey media administrator" on storage.objects for all to authenticated
 using(bucket_id in ('journey-drafts','journey-media') and public.journey_is_admin())
 with check(bucket_id in ('journey-drafts','journey-media') and public.journey_is_admin());
notify pgrst,'reload schema';
commit;
