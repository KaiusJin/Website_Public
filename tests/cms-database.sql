-- Run against a disposable fixture database after the migration, never a live project.
begin;
set local role authenticated;
select set_config('request.jwt.claims','{"email":"kaixuan.jin@outlook.com"}',true);
do $$ declare d public.content_drafts; r jsonb; old_revision timestamptz; result_count integer; begin
 if public.journey_fields('auth.users') is not null then raise exception 'Table allowlist failed'; end if;
 if public.journey_fields('experiences') is not null then raise exception 'Legacy experience table remains allowed'; end if;
 if public.journey_fields('work_experiences') is null or public.journey_fields('club_experiences') is null or public.journey_fields('volunteer_experiences') is null then raise exception 'Split experience allowlist failed'; end if;
 select * into d from public.journey_save_draft('personal_entries','11111111-1111-4111-8111-111111111111','{"kind":"daily","title":"Fixture only","visibility":"public","translations":{"zh-CN":{"title":"测试"}},"order":0}',null,null);
 if exists(select from public.personal_entries where id=d.target_id) then raise exception 'Draft leaked into live table'; end if;
 begin perform public.journey_save_draft('personal_entries',d.target_id,d.payload,null,null);raise exception 'Expected conflict';exception when serialization_failure then null;end;
 r:=public.journey_publish(d.id,d.updated_at);
 if r->>'title'<>'Fixture only' then raise exception 'Publish failed'; end if;
 old_revision:=(r->>'updated_at')::timestamptz;
 select * into d from public.content_drafts where id=d.id;
 select * into d from public.journey_save_draft('personal_entries',d.target_id,d.payload||'{"title":"Changed"}',old_revision,d.updated_at);
 update public.personal_entries set title='External edit' where id=d.target_id;
 begin perform public.journey_publish(d.id,d.updated_at);raise exception 'Expected live conflict';exception when serialization_failure then null;end;
 begin perform public.journey_save_draft('projects',gen_random_uuid(),'{"id":"bad","visibility":"public"}',null,null);raise exception 'Expected rejection';exception when raise_exception then if sqlerrm='Expected rejection' then raise;end if;end;
 insert into public.personal_entries(kind,title,visibility) values('daily','Private fixture','private');
 select count(*) into result_count from public.personal_entries;
 if result_count<>2 then raise exception 'Admin read failed';end if;
 perform public.journey_reorder('personal_entries',(select jsonb_agg(jsonb_build_object('id',id,'updated_at',updated_at) order by title) from public.personal_entries));
 begin perform public.journey_reorder('personal_entries','[]');raise exception 'Expected stale order conflict';exception when serialization_failure then null;end;
end $$;
select set_config('request.jwt.claims','{"email":"unprivileged@example.test"}',true);
do $$ begin
 if (select count(*) from public.personal_entries)<>1 then raise exception 'Non-admin sees private content';end if;
 if exists(select from public.content_drafts) then raise exception 'Non-admin sees drafts';end if;
 begin perform public.journey_save_draft('projects',gen_random_uuid(),'{"visibility":"public"}',null,null);raise exception 'Expected auth rejection';exception when insufficient_privilege then null;end;
end $$;
set local role anon;
select set_config('request.jwt.claims','{}',true);
do $$ begin
 if (select count(*) from public.personal_entries)<>1 then raise exception 'Anonymous visibility failed';end if;
 begin perform * from public.content_drafts;raise exception 'Draft grants leaked';exception when insufficient_privilege then null;end;
 begin insert into public.personal_entries(kind,title) values('daily','unauthorized');raise exception 'Anonymous write allowed';exception when insufficient_privilege then null;end;
end $$;
rollback;
select 'PASS: draft isolation, bilingual publish, concurrent edits, allowlist, ordering, administrator/anon RLS' as verification;
