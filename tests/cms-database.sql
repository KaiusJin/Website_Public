-- Run against a disposable fixture database after all migrations, never a live project.
begin;
do $$ begin
 if not exists(select 1 from storage.buckets where id='journey-media') then raise exception 'Public media bucket is missing'; end if;
 if exists(
  select 1 from pg_policies
  where schemaname='storage' and tablename='objects' and policyname='Journey media administrator'
   and (coalesce(qual,'') like '%journey-drafts%' or coalesce(with_check,'') like '%journey-drafts%')
 ) then raise exception 'Storage policy still allows the retired draft bucket'; end if;
 if not exists(
  select 1 from pg_policies
  where schemaname='storage' and tablename='objects' and policyname='Journey media administrator'
   and coalesce(qual,'') like '%journey-media%' and coalesce(with_check,'') like '%journey-media%'
 ) then raise exception 'Storage policy is not limited to journey-media'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claims','{"email":"kaixuan.jin@outlook.com"}',true);
do $$ declare result_count integer; has_obsolete_columns boolean; begin
 if to_regprocedure('public.journey_fields(text)') is not null then raise exception 'Obsolete field allowlist remains'; end if;
 if to_regprocedure('public.journey_reorder(text,jsonb)') is not null then raise exception 'Obsolete reorder RPC remains'; end if;
 select exists(select from information_schema.columns where table_schema='public' and column_name in ('visibility','translations','date_badge')) into has_obsolete_columns;
 if has_obsolete_columns then raise exception 'Obsolete content column remains in database'; end if;
 if exists(select 1 from information_schema.columns where table_schema='public' and ((table_name='skills' and column_name='category_slug') or (table_name='media_assets' and column_name='caption'))) then raise exception 'Unused metadata columns remain'; end if;
 if to_regclass('public.experiences') is not null then raise exception 'Legacy experiences table remains'; end if;
 if not exists(select 1 from public.work_experiences where id='00000000-0000-0000-0000-000000001000' and title='Legacy employer' and bullets->0->>'text'='Preserve this achievement' and skills->0->>'tag'='SQL' and start_date='Jan 2024') then raise exception 'Legacy content was not preserved'; end if;
 if to_regclass('public.content_drafts') is not null then raise exception 'Obsolete draft table remains'; end if;
 if not has_table_privilege('anon','public.projects','select') or has_table_privilege('anon','public.projects','insert') then raise exception 'Anonymous grants are not read-only'; end if;
 if not has_table_privilege('authenticated','public.projects','select')
  or not has_table_privilege('authenticated','public.projects','insert')
  or not has_table_privilege('authenticated','public.projects','update')
  or not has_table_privilege('authenticated','public.projects','delete') then raise exception 'Authenticated content grants are incomplete'; end if;
 if has_table_privilege('anon','public.media_assets','select')
  or not has_table_privilege('authenticated','public.media_assets','select')
  or not has_table_privilege('authenticated','public.media_assets','insert')
  or not has_table_privilege('authenticated','public.media_assets','update')
  or not has_table_privilege('authenticated','public.media_assets','delete') then raise exception 'Media grants are incorrect'; end if;
 insert into public.personal_entries(kind,title,"order") values('daily','Fixture one',1),('travel','Fixture two',0);
 insert into public.skills(category,"order") select 'Icon fixture '||i,i from generate_series(0,11) i;
 if (select count(distinct category_icon) from public.skills where category like 'Icon fixture %')<>10 then raise exception 'Icon palette does not cycle through ten glyphs'; end if;
 if (select category_icon from public.skills where category='Icon fixture 0') is distinct from (select category_icon from public.skills where category='Icon fixture 10') then raise exception 'Icon cycle does not wrap'; end if;
 update public.skills set "order"=1 where category='Icon fixture 0';
 if (select category_icon from public.skills where category='Icon fixture 0')<>'fas fa-server' then raise exception 'Skill icon was not assigned on reorder'; end if;
 insert into public.work_experiences(title,"order") values('Auto icon work',9);
 insert into public.club_experiences(title,"order") values('Auto icon club',10);
 insert into public.volunteer_experiences(title,"order") values('Auto icon volunteer',11);
 if (select role_icon from public.work_experiences where title='Auto icon work')<>'fas fa-layer-group' or (select role_icon from public.club_experiences where title='Auto icon club')<>'fas fa-code' or (select role_icon from public.volunteer_experiences where title='Auto icon volunteer')<>'fas fa-server' then raise exception 'Experience icons were not generated'; end if;
 select count(*) into result_count from public.personal_entries;
 if result_count<>2 then raise exception 'Admin read failed';end if;
 update public.personal_entries set "order"=case title when 'Fixture one' then 0 else 1 end;
 if (select count(distinct "order") from public.personal_entries)<>2 then raise exception 'Admin ordering update failed';end if;
end $$;
select set_config('request.jwt.claims','{"email":"unprivileged@example.test"}',true);
do $$ begin
 if (select count(*) from public.personal_entries)<>2 then raise exception 'Authenticated public read failed';end if;
 begin insert into public.personal_entries(kind,title) values('daily','unauthorized');raise exception 'Unauthorized write allowed';exception when insufficient_privilege then null;end;
end $$;
set local role anon;
select set_config('request.jwt.claims','{}',true);
do $$ begin
 if (select count(*) from public.personal_entries)<>2 then raise exception 'Anonymous public read failed';end if;
 begin insert into public.personal_entries(kind,title) values('daily','unauthorized');raise exception 'Anonymous write allowed';exception when insufficient_privilege then null;end;
end $$;
rollback;
select 'PASS: one English live record, no obsolete compatibility, split experiences, ordering and RLS' as verification;
