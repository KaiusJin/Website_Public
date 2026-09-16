-- Read-only contract for the live Personal Website database.
-- Run in the Supabase SQL editor with a role that can inspect pg_catalog.
-- Every returned `passed` value should be true. This does not replay migrations
-- or write production data.

with expected_tables (table_name, public_read) as (
  values
    ('projects', true),
    ('work_experiences', true),
    ('club_experiences', true),
    ('volunteer_experiences', true),
    ('awards', true),
    ('skills', true),
    ('site_profile', true),
    ('personal_entries', true),
    ('journey_scene_content', true),
    ('media_assets', false)
),
expected_profile_columns (column_name, data_type) as (
  values
    ('name', 'text'),
    ('hero_badge', 'text'),
    ('hero_tags', 'jsonb'),
    ('heading', 'text'),
    ('intro', 'text'),
    ('bio', 'text'),
    ('education', 'text'),
    ('focus_areas', 'text'),
    ('contact_slogans', 'jsonb'),
    ('location', 'text'),
    ('email', 'text'),
    ('github', 'text'),
    ('linkedin', 'text'),
    ('resume_url', 'text'),
    ('journey_en', 'jsonb'),
    ('journey_zh', 'jsonb')
),
checks (check_name, passed) as (
  select 'Content tables exist and have RLS',
    count(*) = 10 and coalesce(bool_and(c.relrowsecurity), false)
  from expected_tables e
  left join pg_namespace n on n.nspname = 'public'
  left join pg_class c on c.relnamespace = n.oid and c.relname = e.table_name and c.relkind = 'r'
  where c.oid is not null

  union all

  select 'Public content has anonymous read policies',
    coalesce(bool_and(exists (
      select 1 from pg_policies p
      where p.schemaname = 'public' and p.tablename = e.table_name
        and p.cmd = 'SELECT' and 'anon' = any(p.roles) and p.qual = 'true'
    )), false)
  from expected_tables e where e.public_read

  union all

  select 'Anonymous reads and authenticated writes have table grants',
    coalesce(bool_and(
      coalesce(has_table_privilege('anon', c.oid, 'SELECT') = e.public_read, false)
      and coalesce(has_table_privilege('authenticated', c.oid, 'INSERT'), false)
      and coalesce(has_table_privilege('authenticated', c.oid, 'UPDATE'), false)
      and coalesce(has_table_privilege('authenticated', c.oid, 'DELETE'), false)
    ), false)
  from expected_tables e
  left join pg_namespace n on n.nspname = 'public'
  left join pg_class c on c.relnamespace = n.oid and c.relname = e.table_name and c.relkind = 'r'

  union all

  select 'Writes require the administrator policy',
    coalesce(bool_and(exists (
      select 1 from pg_policies p
      where p.schemaname = 'public' and p.tablename = e.table_name
        and p.cmd = 'ALL' and 'authenticated' = any(p.roles)
        and p.qual = 'journey_is_admin()'
        and p.with_check = 'journey_is_admin()'
    )), false)
  from expected_tables e

  union all

  select 'Classic and Journey profile columns have expected types',
    coalesce(bool_and(coalesce(c.data_type = e.data_type, false)), false)
  from expected_profile_columns e
  left join information_schema.columns c
    on c.table_schema = 'public' and c.table_name = 'site_profile'
    and c.column_name = e.column_name

  union all

  select 'One profile row has Classic arrays and Journey locale objects',
    count(*) = 1 and coalesce(bool_and(
      name <> ''
      and jsonb_typeof(hero_tags) = 'array'
      and jsonb_typeof(contact_slogans) = 'array'
      and jsonb_typeof(journey_en) = 'object'
      and jsonb_typeof(journey_zh) = 'object'
      and journey_en ?& array[
        'welcome_intro', 'focus', 'heading', 'intro', 'bio',
        'education_school', 'education_field', 'location_detail',
        'contact_heading', 'contact_intro', 'contact_outro'
      ]
      and journey_zh ?& array[
        'welcome_intro', 'focus', 'heading', 'intro', 'bio',
        'education_school', 'education_field', 'location_detail',
        'contact_heading', 'contact_intro', 'contact_outro'
      ]
    ), false)
  from public.site_profile

  union all

  select 'Saved experience and skill icons have triggers',
    count(distinct c.relname) = 4
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and not t.tgisinternal
    and c.relname in ('work_experiences', 'club_experiences', 'volunteer_experiences', 'skills')
    and t.tgname like '%icon%'

  union all

  select 'Retired experience and draft tables are absent',
    to_regclass('public.experiences') is null
    and to_regclass('public.content_drafts') is null
)
select check_name, passed from checks order by check_name;
