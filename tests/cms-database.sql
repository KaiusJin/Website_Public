-- Run against a disposable fixture database after all migrations, never a live project.
begin;
set local role authenticated;
select set_config('request.jwt.claims','{"email":"kaixuan.jin@outlook.com"}',true);
do $$ declare result_count integer; has_obsolete_columns boolean; begin
 if public.journey_fields('auth.users') is not null then raise exception 'Table allowlist failed'; end if;
 if public.journey_fields('experiences') is not null then raise exception 'Legacy experience table remains allowed'; end if;
 if public.journey_fields('work_experiences') is null or public.journey_fields('club_experiences') is null or public.journey_fields('volunteer_experiences') is null then raise exception 'Split experience allowlist failed'; end if;
 if 'visibility'=any(public.journey_fields('projects')) then raise exception 'Visibility remains in allowlist'; end if;
 select exists(select from information_schema.columns where table_schema='public' and column_name in ('visibility','translations')) into has_obsolete_columns;
 if has_obsolete_columns then raise exception 'Obsolete visibility/translations column remains in database'; end if;
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
 select count(*) into result_count from public.personal_entries;
 if result_count<>2 then raise exception 'Admin read failed';end if;
 perform public.journey_reorder('personal_entries',(select jsonb_agg(jsonb_build_object('id',id,'updated_at',updated_at) order by title) from public.personal_entries));
 begin perform public.journey_reorder('personal_entries','[]');raise exception 'Expected stale order conflict';exception when serialization_failure then null;end;
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
select 'PASS: one English live record, no visibility/drafts/translations, split experiences, ordering and RLS' as verification;
