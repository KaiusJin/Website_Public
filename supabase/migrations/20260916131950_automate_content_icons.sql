-- Icons are chosen from ten built-in FontAwesome glyphs, by the saved order.
-- No user-provided icon URLs or icon classes are needed.
begin;

-- Refuse to discard content added since the audit.
do $$ begin
 if exists(select 1 from public.skills where nullif(category_slug,'') is not null) then
  raise exception 'category_slug contains content; review it before retiring the column';
 end if;
 if exists(select 1 from public.media_assets where nullif(caption,'') is not null) then
  raise exception 'media_assets.caption contains content; review it before retiring the column';
 end if;
end $$;
alter table public.skills drop column category_slug;
alter table public.media_assets drop column caption;
alter table public.skills add column category_icon text;

create function public.journey_assign_icon() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
 icons constant text[] := array[
  'fas fa-code','fas fa-server','fas fa-laptop-code','fas fa-database','fas fa-cloud',
  'fas fa-terminal','fas fa-cubes','fas fa-microchip','fas fa-network-wired','fas fa-layer-group'
 ];
 icon text := icons[1 + ((coalesce(new."order",0) % 10 + 10) % 10)];
begin
 if tg_table_name = 'skills' then new.category_icon := icon;
 else new.role_icon := icon;
 end if;
 return new;
end $$;

do $$ declare t text; begin
 foreach t in array array['skills','work_experiences','club_experiences','volunteer_experiences'] loop
  execute format('create trigger journey_content_icon before insert or update on public.%I for each row execute function public.journey_assign_icon()',t);
  execute format('update public.%I set "order" = "order"',t);
 end loop;
end $$;
alter table public.skills alter column category_icon set not null;
notify pgrst, 'reload schema';
commit;
